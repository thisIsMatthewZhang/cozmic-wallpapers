import { initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

export const health = onRequest({ region: "us-central1" }, (_request, response) => {
  response.json({ ok: true });
});

export const createGenerationJob = onRequest(
  { region: "us-central1", cors: false },
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const appCheckToken = request.header("X-Firebase-AppCheck");
      const idToken = request.header("Authorization")?.replace("Bearer ", "");

      if (!appCheckToken || !idToken) {
        response.status(401).json({ error: "Unauthorized." });
        return;
      }

      await getAppCheck().verifyToken(appCheckToken);
      const user = await getAuth().verifyIdToken(idToken);

      response.json({
        ok: true,
        uid: user.uid,
        message: "Ready to enqueue a wallpaper generation job.",
      });
    } catch {
      response.status(401).json({ error: "Unauthorized." });
    }
  },
);
