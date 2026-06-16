import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from 'firebase-functions/firestore';
import { defineInt } from "firebase-functions/params";
import { GENAI_CLIENT, NANO_BANANA, PREFLIGHT_MODEL, Model } from './gemini-client.js';
import { CREDIT_COST_MAPPING } from "./resolution-credit-mapping.js";
import { PreflightPromptClassifier } from "./types/preflight-prompt-classifier.js";
import { CREDIT_PLANS, PRODUCT_IDS } from "./types/credit-plan.js";
import { COZMIC_WALLPAPER_CONTEXT } from "./system-prompt.js";
import { GoogleGenAI, GenerateContentConfig, HarmCategory, HarmBlockThreshold, Type, SafetySetting } from "@google/genai";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { Environment, NotificationTypeV2, SignedDataVerifier, Type as AppleProductType } from "@apple/app-store-server-library";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();
const MIN_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 5;
const APPLE_APP_ID = defineInt("APPLE_APP_ID");
const APPLE_BUNDLE_ID = "app.wallpapers.cozmic";
const APPLE_ROOT_CERTIFICATES = [
  "AppleIncRootCertificate.cer",
  "AppleRootCA-G2.cer",
  "AppleRootCA-G3.cer",
].map((fileName) => readFileSync(new URL(`../certs/${fileName}`, import.meta.url)));
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
      usage: {
        candidateOutputTokens: 0,
        thoughtTokens: 0,
        totalTokens: 0
      }
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
          totalTokens: totalTokens === 0 ? null : totalTokens
        }
      });
    });
  }
);

export const verifyAppleIAP = onCall(
  { region: "us-central1", enforceAppCheck: false },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = req.auth.uid;
    const { productId, transactionId, purchaseToken } = req.data ?? {};
    if (!isProductId(productId) || typeof transactionId !== "string" || !transactionId || typeof purchaseToken !== "string" || !purchaseToken) {
      throw new HttpsError("invalid-argument", "Valid Apple purchase data is required.");
    }

    const userRef = db.doc(`users/${uid}`);
    const userSnapshot = await userRef.get();
    const appAccountToken = userSnapshot.data()?.appleAppAccountToken;
    if (!userSnapshot.exists || typeof appAccountToken !== "string") {
      throw new HttpsError("failed-precondition", "Apple purchase context is not initialized.");
    }

    let decodedTransaction;
    try {
      const environment = getAppleTransactionEnvironment(purchaseToken);
      const verifier = new SignedDataVerifier(
        APPLE_ROOT_CERTIFICATES,
        true,
        environment,
        APPLE_BUNDLE_ID,
        environment === Environment.PRODUCTION ? APPLE_APP_ID.value() : undefined,
      );
      decodedTransaction = await verifier.verifyAndDecodeTransaction(purchaseToken);
    } catch (error) {
      console.error("Apple transaction verification failed", error);
      throw new HttpsError("permission-denied", "Apple could not verify this purchase.");
    }

    if (
      decodedTransaction.productId !== productId ||
      decodedTransaction.transactionId !== transactionId ||
      decodedTransaction.appAccountToken?.toLowerCase() !== appAccountToken.toLowerCase() ||
      decodedTransaction.type !== AppleProductType.CONSUMABLE ||
      decodedTransaction.quantity !== 1 ||
      decodedTransaction.revocationDate !== undefined
    ) {
      throw new HttpsError("permission-denied", "Apple purchase details did not match this request.");
    }

    const credits = CREDIT_PLANS[productId].credits;
    const paymentRef = db.doc(`payments/${transactionId}`);
    const alreadyFulfilled = await db.runTransaction(async (transaction) => {
      const [freshUserSnapshot, paymentSnapshot] = await Promise.all([
        transaction.get(userRef),
        transaction.get(paymentRef),
      ]);

      if (!freshUserSnapshot.exists) {
        throw new HttpsError("not-found", "User profile was not found.");
      }
      if (paymentSnapshot.exists) {
        const payment = paymentSnapshot.data();
        if (
          payment?.uid !== uid ||
          payment.productId !== productId ||
          payment.credits !== credits ||
          payment.provider !== "apple"
        ) {
          throw new HttpsError("permission-denied", "This Apple transaction was already claimed.");
        }
        return true;
      }

      transaction.update(userRef, {
        creditBalance: FieldValue.increment(credits),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(paymentRef, {
        paymentId: transactionId,
        provider: "apple",
        uid,
        productId,
        credits,
        environment: decodedTransaction.environment ?? null,
        purchaseDate: decodedTransaction.purchaseDate ?? null,
        fulfilledAt: FieldValue.serverTimestamp(),
      });
      return false;
    });

    return { verified: true, alreadyFulfilled, credits };
  }
);

export const appleIAPNotifications = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.set("Allow", "POST").status(405).send("Method not allowed");
      return;
    }

    const signedPayload = req.body?.signedPayload;
    if (typeof signedPayload !== "string" || !signedPayload) {
      res.status(400).send("Missing signedPayload");
      return;
    }

    try {
      const environment = getAppleSignedPayloadEnvironment(signedPayload);
      const verifier = new SignedDataVerifier(
        APPLE_ROOT_CERTIFICATES,
        true,
        environment,
        APPLE_BUNDLE_ID,
        environment === Environment.PRODUCTION ? APPLE_APP_ID.value() : undefined,
      );
      const notification = await verifier.verifyAndDecodeNotification(signedPayload);
      const notificationId = notification.notificationUUID;

      if (!notificationId) {
        res.status(400).send("Missing notification UUID");
        return;
      }

      let transactionId: string | null = null;
      let uid: string | null = null;
      let productId: string | null = null;
      let credits: number | null = null;
      if (notification.data?.signedTransactionInfo) {
        const decodedTransaction = await verifier.verifyAndDecodeTransaction(notification.data.signedTransactionInfo);
        transactionId = decodedTransaction.transactionId ?? null;
        productId = decodedTransaction.productId ?? null;

        if (transactionId) {
          const paymentSnapshot = await db.doc(`payments/${transactionId}`).get();
          uid = paymentSnapshot.data()?.uid ?? null;
          credits = paymentSnapshot.data()?.credits ?? null;
        }
      }

      await db.doc(`appleIAPNotifications/${notificationId}`).create(
        {
          notificationId,
          notificationType: notification.notificationType ?? null,
          subtype: notification.subtype ?? null,
          environment: notification.data?.environment ?? null,
          productId,
          transactionId,
          uid,
          signedDate: notification.signedDate ?? null,
          receivedAt: FieldValue.serverTimestamp(),
        },
      ).catch((error: unknown) => {
        if (isAlreadyExistsError(error)) return;
        throw error;
      });

      if (
        notification.notificationType === NotificationTypeV2.REFUND &&
        transactionId &&
        uid &&
        typeof credits === "number"
      ) {
        await db.runTransaction(async (transaction) => {
          const paymentRef = db.doc(`payments/${transactionId}`);
          const paymentSnapshot = await transaction.get(paymentRef);
          if (!paymentSnapshot.exists || paymentSnapshot.data()?.refunded === true) return;

          transaction.update(db.doc(`users/${uid}`), {
            creditBalance: FieldValue.increment(-credits),
            updatedAt: FieldValue.serverTimestamp(),
          });
          transaction.update(paymentRef, {
            refunded: true,
            refundedAt: FieldValue.serverTimestamp(),
          });
        });
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Apple IAP notification verification failed", error);
      res.status(400).send("Invalid signedPayload");
    }
  },
);

export const prepareAppleIAP = onCall(
  { region: "us-central1", enforceAppCheck: false },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const userRef = db.doc(`users/${req.auth.uid}`);
    const appAccountToken = await db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new HttpsError("not-found", "User profile was not found.");
      }

      const existingToken = userSnapshot.data()?.appleAppAccountToken;
      if (typeof existingToken === "string" && existingToken) {
        return existingToken;
      }

      const token = randomUUID();
      transaction.update(userRef, {
        appleAppAccountToken: token,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return token;
    });

    return { appAccountToken };
  },
);

function isProductId(value: unknown): value is typeof PRODUCT_IDS[number] {
  return typeof value === "string" && PRODUCT_IDS.some(id => id === value);
}

function getAppleTransactionEnvironment(signedTransaction: string): Environment {
  return getAppleSignedPayloadEnvironment(signedTransaction);
}

function getAppleSignedPayloadEnvironment(signedPayload: string): Environment {
  try {
    const payload = signedPayload.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      data?: { environment?: unknown };
      environment?: unknown;
    };
    const environment = decoded.environment ?? decoded.data?.environment;
    if (environment === Environment.PRODUCTION) return Environment.PRODUCTION;
    if (environment === Environment.SANDBOX) return Environment.SANDBOX;
  } catch {
    // The signed payload is fully validated immediately after this routing check.
  }
  throw new HttpsError("invalid-argument", "Unsupported Apple transaction environment.");
}

function isAlreadyExistsError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === 6 || error.code === "already-exists")
  );
}
