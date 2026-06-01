import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from 'firebase-functions/firestore';
import { GENAI_CLIENT, NANO_BANANA, Model } from './gemini-client.js';
import { CREDIT_COST_MAPPING } from "./resolution-credit-mapping.js";
import { GoogleGenAI, GenerateImagesConfig, ImageConfig, GenerateContentConfig } from "@google/genai";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();
const MIN_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 5;

/**
 * 
 * @param prompt user-provided prompt message describing the image(s)
 * @param param2 destructured object literal with individual property defaults set for GenerateImagesParameters.config
 * @param ai Google GenAI client for the application
 * @param model chosen model used to fulfill request and generate response
 * @returns GenerateImagesResponse object
 */
async function createImage(prompt: string, { candidateCount = 1, imageConfig = { imageSize: "1K", aspectRatio: "1:1" } }: GenerateContentConfig = {}, ai: GoogleGenAI = GENAI_CLIENT, model: Model = NANO_BANANA) {
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      candidateCount: candidateCount, 
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

    const { prompt, numberOfImages } = req.data;
    if (typeof prompt !== "string" || !prompt.trim()) {
      throw new HttpsError("invalid-argument", "Prompt is required.");
    }
    if (!Number.isInteger(numberOfImages) || numberOfImages < MIN_IMAGE_COUNT || numberOfImages > MAX_IMAGE_COUNT) throw new HttpsError("invalid-argument", "Number of images must be between 1 to 5.");
    
    const requestedResolution = req.data!.requestedResolution as keyof typeof CREDIT_COST_MAPPING;
    if (typeof requestedResolution !== "string" || !(requestedResolution in CREDIT_COST_MAPPING)) { 
      throw new HttpsError("invalid-argument", "Please select a valid output resolution (1K, 2K, or 4K"); 
    }
    
    const docSnapshot = await db.doc(`users/${req.auth.uid}`).get();
    if (!docSnapshot.exists) { 
      throw new HttpsError("failed-precondition", "User profile did not initialize properly. Unable to start image creation."); 
    }
    
    const user = docSnapshot.data();
    if (!user) { 
      throw new HttpsError("not-found", "No data found with your profile. Please reach out to support."); 
    }
    if ((user.creditBalance ?? 0) < CREDIT_COST_MAPPING[requestedResolution] * numberOfImages) {
      throw new HttpsError("unavailable", "Not enough credits to generate image.");
    }

    const jobRef = db.collection("generationJobs").doc();
    await jobRef.set({
      jobId: jobRef.id,
      uid: req.auth.uid,
      prompt,
      resolution: requestedResolution,
      numberOfImages,
      creditCost: CREDIT_COST_MAPPING[requestedResolution] * numberOfImages,
      status: "queued",
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
    const response = await createImage(data.prompt, { 
      candidateCount: data.numberOfImages, 
      imageConfig: { 
        imageSize: data.resolution,
        aspectRatio: data.aspectRatio, 
      } 
    });
    if (!response?.candidates?.[0]?.content?.parts) {
      await event.data?.ref.update({
        status: 'failed',
        updatedAt: FieldValue.serverTimestamp(),
        errorMessage: "Images failed to generate."
      });
      throw new HttpsError("internal", "We had an issue with creating your image. Used credits will be refunded.");
    }
    let imagePaths = await Promise.all(response.candidates[0].content.parts.map(async (part, index) => {
      // Gemini API responds with candidates, each containing base64-encoded byte data for each image.
      // Firestore will hold references to the byte data stored in a bucket.
      const ind = index + 1;
      const imagePath = `users/${data.uid}/generations/${jobId}/image-${ind}.png`;
      const imageBytes = part.inlineData?.data;
      if (!imageBytes) {
        await event.data?.ref.update({
          status: 'failed',
          updatedAt: FieldValue.serverTimestamp(),
          errorMessage: `Issue with image-${index}.`
        });
        throw new Error(`There was an issue when processing image-${ind}.png`);
      }
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
      return imagePath;
    }));
    const docRef = db.doc(`users/${data.uid}`);
    await docRef.update({ creditBalance: FieldValue.increment(-data.creditCost) })
    .then(async () => {
      await event.data?.ref.update({
        status: 'complete',
        updatedAt: FieldValue.serverTimestamp(),
        imagePaths // image references stored to Firestore
      });
    });
  }
);