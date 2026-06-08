import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from 'firebase-functions/firestore';
import { GENAI_CLIENT, NANO_BANANA, PREFLIGHT_MODEL, Model } from './gemini-client.js';
import { CREDIT_COST_MAPPING } from "./resolution-credit-mapping.js";
import { PreflightPromptClassifier } from "./types/preflight-prompt-classifier.js";
import { COZMIC_WALLPAPER_CONTEXT } from "./system-prompt.js";
import { GoogleGenAI, GenerateContentConfig, HarmCategory, HarmBlockThreshold, Type, SafetySetting } from "@google/genai";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();
const MIN_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 5;
const VALID_ASPECT_RATIOS = ["9:16" , "16:9" , "3:4" , "4:3" , "2:3" , "3:2" , "1:1"] as const;
const SAFETY_SETTINGS: SafetySetting[] = [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        }
      ] as const;

async function classifyPreflightPrompt(userPrompt: string, ai: GoogleGenAI = GENAI_CLIENT): Promise<PreflightPromptClassifier> {
  const prompt = userPrompt.trim();
  if (!prompt) {
    return { allowed: false, reason: "Prompt is required.", prompt: null };
  }
  if (prompt.length > 2000) {
    return { allowed: false, reason: "Prompt is too long.", prompt: null };
  }

  const response = await ai.models.generateContent({
    model: PREFLIGHT_MODEL,
    contents: prompt,
    config: {
      systemInstruction:
        "Classify whether this user prompt is safe and suitable for AI wallpaper generation. " +
        "Reject requests for explicit sexual content, nudity, minors in sexual contexts, graphic violence, gore, hate, harassment, self-harm, illegal acts, weapons instructions, or evasion of safety rules. " +
        "Return only JSON matching the schema. If allowed, optionally provide a concise cleaned prompt preserving the user's intent.",
      temperature: 0,
      maxOutputTokens: 120,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          allowed: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
          prompt: { type: Type.STRING, nullable: true }
        },
        required: ["allowed", "reason"]
      },
      safetySettings: SAFETY_SETTINGS
    }
  });
  if (response.promptFeedback?.blockReason || response.candidates?.some(candidate => candidate.finishReason === "SAFETY")) {
    return { allowed: false, reason: "This prompt is not allowed.", prompt: null };
  }
  try {
    const text = response.text?.trim();
    if (!text) {
      return { allowed: false, reason: "Unable to classify prompt.", prompt: null };
    }

    const result = JSON.parse(text) as Partial<PreflightPromptClassifier>;
    return {
      allowed: result.allowed === true,
      reason: typeof result.reason === "string" ? result.reason : "",
      prompt: typeof result.prompt === "string" && result.prompt.trim() ? result.prompt.trim() : prompt
    };
  } catch {
    return { allowed: false, reason: "Unable to classify prompt.", prompt: null };
  }
}

/**
 * 
 * @param userPrompt user-provided prompt message describing the image(s) to generate
 * @param param2 destructured object literal with individual property defaults set for GenerateImagesParameters.config
 * @param ai Google GenAI client for the application
 * @param model chosen model used to fulfill request and generate response
 * @returns GenerateImagesResponse object
 */
async function createImage(userPrompt: string, { imageConfig = { imageSize: "1K", aspectRatio: "9:16" } }: GenerateContentConfig = {}, ai: GoogleGenAI = GENAI_CLIENT, model: Model = NANO_BANANA) {
  const response = await ai.models.generateContent({
    model: model,
    contents: userPrompt,
    config: {
      systemInstruction: COZMIC_WALLPAPER_CONTEXT,
      responseModalities: ["IMAGE"],
      imageConfig: {
        imageSize: imageConfig.imageSize,
        aspectRatio: imageConfig.aspectRatio,
      } 
    }
  });
  return response;
}

/**
 * Callable that queues a new generation job (does not perform the process of generating images).
 * Client validation is processed along with prompt checking.
 */
export const startGenerationJob = onCall(
  { region: "us-central1", enforceAppCheck: false },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const { prompt, numberOfImages, requestedResolution, aspectRatio }: { 
      prompt: string, 
      numberOfImages: number, 
      requestedResolution: keyof typeof CREDIT_COST_MAPPING, 
      aspectRatio: typeof VALID_ASPECT_RATIOS[number]
    } = req.data;

    if (typeof prompt !== "string" || !prompt.trim()) {
      throw new HttpsError("invalid-argument", "Prompt is required.");
    }
    if (!Number.isInteger(numberOfImages) || numberOfImages < MIN_IMAGE_COUNT || numberOfImages > MAX_IMAGE_COUNT) throw new HttpsError("invalid-argument", "Number of images must be between 1 to 5.");
    
    if (typeof requestedResolution !== "string" || !(requestedResolution in CREDIT_COST_MAPPING)) { 
      throw new HttpsError("invalid-argument", "Please select a valid output resolution (1K, 2K, or 4K)."); 
    }
    
    if (!(VALID_ASPECT_RATIOS.includes(aspectRatio))) {
      throw new HttpsError("invalid-argument", "Your device's aspect ratio is not supported."); 
    }

    const preflight = await classifyPreflightPrompt(prompt);
    if (!preflight.allowed) {
      throw new HttpsError("invalid-argument", preflight.reason || "This prompt is not allowed.");
    }
    
    const docSnapshot = await db.doc(`users/${req.auth.uid}`).get();
    if (!docSnapshot.exists) { 
      throw new HttpsError("failed-precondition", "User profile did not initialize properly. Unable to start image creation."); 
    }
    
    const user = docSnapshot.data();
    if (!user) { 
      throw new HttpsError("not-found", "No data found with your profile."); 
    }
    if ((user.creditBalance ?? 0) < CREDIT_COST_MAPPING[requestedResolution] * numberOfImages) {
      throw new HttpsError("unavailable", "Not enough credits to generate image.");
    }

    const jobRef = db.collection("generationJobs").doc();
    await jobRef.set({
      jobId: jobRef.id,
      uid: req.auth.uid,
      prompt: preflight.prompt ?? prompt,
      resolution: requestedResolution,
      numberOfImages,
      creditCost: CREDIT_COST_MAPPING[requestedResolution] * numberOfImages,
      status: "queued",
      aspectRatio,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { jobId: jobRef.id };
  }
);

/**
 * Listens to the addition of a new job document to generationJobs collection.
 * On trigger, checks the existence of a doc snapshot, updates doc's 'status' field to 'processing', then proceeds to invoke image generation
 */
export const processGenerationJob = onDocumentCreated(
  "generationJobs/{jobId}",
  async (event) => {
    const snapshot = event.data;
    const jobId = event.params.jobId;
    if (!snapshot) {
      throw new HttpsError("not-found", "There was an issue with finding the document associated with this generation job");
    }
    const data = snapshot.data();
    await event.data?.ref.update({
      status: 'processing',
      updatedAt: FieldValue.serverTimestamp()
    });
    let candidateOutputTokens = 0;
    let thoughtTokens = 0;
    let totalTokens = 0;
    const imagePaths = await Promise.all(
      Array.from({ length: data.numberOfImages }, async (_, index) => {
        const response = await createImage(data.prompt, {
          imageConfig: {
            imageSize: data.resolution,
            aspectRatio: data.aspectRatio,
          }
        });

        const imageBytes = response.candidates
          ?.flatMap((candidate) => candidate.content?.parts ?? [])
          .find((part) => part.inlineData?.data)
          ?.inlineData?.data;

        if (!imageBytes) {
          await event.data?.ref.update({
            status: 'failed',
            updatedAt: FieldValue.serverTimestamp(),
            errorMessage: `Issue with image-${index}.`
          });
          throw new Error(`There was an issue when processing image-${index + 1}.png`);
        }

        const ind = index + 1;
        const imagePath = `users/${data.uid}/generations/${jobId}/image-${ind}.png`;
        const buffer = Buffer.from(imageBytes, "base64");
        await bucket.file(imagePath).save(buffer, {
          metadata: {
            contentType: "image/png",
            metadata: {
              uid: data.uid,
              jobId,
              imageIndex: String(ind)
            }
          }
        });
        if (response?.usageMetadata?.candidatesTokenCount) {
          candidateOutputTokens += response.usageMetadata.candidatesTokenCount;
        }
        if (response?.usageMetadata?.thoughtsTokenCount) {
          thoughtTokens += response.usageMetadata.thoughtsTokenCount;
        }        
        if (response?.usageMetadata?.totalTokenCount) {
          totalTokens += response.usageMetadata.totalTokenCount;
        }
        return imagePath;
      })
    );
    const docRef = db.doc(`users/${data.uid}`);
    await docRef.update({ creditBalance: FieldValue.increment(-data.creditCost) })
    .then(async () => {
      await event.data?.ref.update({
        status: 'complete',
        updatedAt: FieldValue.serverTimestamp(),
        imagePaths, // image references stored to Firestore
        usage: {
          candidateOutputTokens: candidateOutputTokens === 0 ? null : candidateOutputTokens,
          thoughtTokens: thoughtTokens === 0 ? null : thoughtTokens,
          totalTokens: totalTokens === 0 ? null : thoughtTokens
        }
      });
    });
  }
);
