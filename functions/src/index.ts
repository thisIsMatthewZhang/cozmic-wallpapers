import { initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { ai, NANO_BANANA_PRO, Model } from './gemini-client.js';
import { GoogleGenAI, GenerateImagesConfig, GenerateContentResponse } from "@google/genai";

initializeApp();

/**
 * 
 * @param ai Google GenAI client for the application
 * @param model chosen model used to fulfill request and generate response
 * @param prompt user-provided prompt message describing the image(s)
 * @param param3 destructured object literal with individual property defaults set for GenerateImagesParameters.config
 * @returns 
 */
async function generateContent(ai: GoogleGenAI, model: Model, prompt: string, { numberOfImages = 1, includeRaiReason = true }: GenerateImagesConfig = {}) {
  const response = await ai.models.generateImages({
    model: model,
    prompt: prompt,
    config: { numberOfImages, includeRaiReason }
  });
  return response;
}

export const startGenerationJob = onCall(
  { region: "us-central1", enforceAppCheck: true },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const { prompt } = req.data;
    if (typeof prompt !== "string" || !prompt.trim()) {
      throw new HttpsError("invalid-argument", "Prompt is required.");
    }

    return {
      ok: true,
      uid: req.auth.uid,
      message: "Ready to enqueue a wallpaper generation job."
    };
  }
);