// Creates a Google GenAI client and sets model constants to Nano Banana
import { GoogleGenAI } from '@google/genai';

export const NANO_BANANA_2 = 'gemini-3.1-flash-image-preview';
export const NANO_BANANA_PRO = 'gemini-3-pro-image-preview';
export const NANO_BANANA = 'gemini-2.5-flash-image';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
