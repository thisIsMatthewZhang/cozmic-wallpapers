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
  async (req, res) => {
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const appCheckToken = req.header("X-Firebase-AppCheck");
      const idToken = req.header("Authorization")?.replace("Bearer ", "");

      if (!appCheckToken || !idToken) {
        res.status(401).json({ error: "Unauthorized." });
        return;
      }

      await getAppCheck().verifyToken(appCheckToken);
      const user = await getAuth().verifyIdToken(idToken);

      res.json({
        ok: true,
        uid: user.uid,
        message: "Ready to enqueue a wallpaper generation job.",
      });
    } catch {
      res.status(401).json({ error: "Unauthorized." });
    }
  },
);

const generateWallpaper = onRequest({ region: "us-central1", cors: false }, (req, res) => {
  
});