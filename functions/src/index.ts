import { initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from 'firebase-functions/firestore';
import { GENAI_CLIENT, NANO_BANANA_2, Model } from './gemini-client.js';
import { MAPPING } from "./resolution-credit-mapping.js";
import { GoogleGenAI, GenerateImagesConfig } from "@google/genai";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp();

/**
 * 
 * @param prompt user-provided prompt message describing the image(s)
 * @param param2 destructured object literal with individual property defaults set for GenerateImagesParameters.config
 * @param ai Google GenAI client for the application
 * @param model chosen model used to fulfill request and generate response
 * @returns GenerateImagesResponse object
 */
async function createImage(prompt: string, { numberOfImages = 1, includeRaiReason = true }: GenerateImagesConfig = {}, ai: GoogleGenAI = GENAI_CLIENT, model: Model = NANO_BANANA_2) {
  const response = await ai.models.generateImages({
    model: model,
    prompt: prompt,
    config: { numberOfImages, includeRaiReason }
  });
  return response;
}

/**
 * Callable that queues a new generation job (does not perform the process of generating images).
 * Client validation is processed along with prompt checking.
 */
export const startGenerationJob = onCall(
  { region: "us-central1", enforceAppCheck: true },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const { prompt, numberOfImages } = req.data;
    if (typeof prompt !== "string" || !prompt.trim()) {
      throw new HttpsError("invalid-argument", "Prompt is required.");
    }

    const db = getFirestore();
    const docSnapshot = await db.doc(`users/${req.auth.uid}`).get();
    const requestedResolution = req.data!.requestedResolution as keyof typeof MAPPING;
    if (docSnapshot.data()!.creditBalance < MAPPING[requestedResolution]) {
      throw new HttpsError("unavailable", "Not enough credits to generate image.");
    }

    const jobRef = await db.collection("generationJobs").add({
        uid: req.auth.uid,
        prompt,
        resolution: requestedResolution,
        numberOfImages,
        creditCost: MAPPING[requestedResolution],
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
    if (!snapshot) {
      console.log("There was an issue with finding the document associated with this generation job");
      return;
    }
    const data = snapshot.data();
    event.data?.ref.update({
      status: 'processing',
      updatedAt: FieldValue.serverTimestamp()
    });
    const response = await createImage(data.prompt, { numberOfImages: data.numberOfImages });
    if (!response.generatedImages!.length || !response.generatedImages) {
      // TODO: refund used credits if generation failed
      event.data?.ref.update({
        status: 'failed',
        updatedAt: FieldValue.serverTimestamp(),
        errorMessage: "Image creation failed"
      });
      throw new HttpsError("internal", "We had an issue with creating your image. Used credits will be refunded.");
    }
    event.data?.ref.update({
      status: 'complete',
      updatedAt: FieldValue.serverTimestamp(),
      imagePath: "" // TODO: specify image path
    });
  }
);