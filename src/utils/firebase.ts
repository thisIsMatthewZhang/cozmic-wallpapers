import { initializeApp, getApp, getApps } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";

import firebaseConfig from "../constants/firebaseConfig";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const authInstance: Auth = getAuth(app);

export const firebaseApp = app;
export const auth = authInstance;
