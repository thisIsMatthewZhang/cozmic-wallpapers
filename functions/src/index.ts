import { initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from 'firebase-functions/firestore';
import { ai, NANO_BANANA_PRO, Model } from './gemini-client.js';
import { MAPPING } from "./resolution-credit-mapping.js";
import { GoogleGenAI, GenerateImagesConfig } from "@google/genai";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp();

/**
 * 
 * @param ai Google GenAI client for the application
 * @param model chosen model used to fulfill request and generate response
 * @param prompt user-provided prompt message describing the image(s)
 * @param param3 destructured object literal with individual property defaults set for GenerateImagesParameters.config
 * @returns 
 */
async function createImage(ai: GoogleGenAI, model: Model, prompt: string, { numberOfImages = 1, includeRaiReason = true }: GenerateImagesConfig = {}) {
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
  // TODO: provide checks for user credit balance
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const { prompt } = req.data;
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
        status: "queued",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    return { jobId: jobRef.id };
  }
);

/**
 * Listens to the addition of a new job document to generationJobs collection.
 * On trigger, 
 */
export const processGenerationJob = onDocumentCreated(
  "generationJobs/{jobId}",
  async (event) => {

  }
);