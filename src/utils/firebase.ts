import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { initializeApp, getApp, getApps } from "firebase/app";
import type { Auth, Persistence } from "firebase/auth";
import {
  connectAuthEmulator,
  initializeAuth,
} from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import type { FirebaseStorage } from "firebase/storage";
import { connectStorageEmulator, getStorage } from "firebase/storage";

import firebaseConfig from "../constants/firebaseConfig";

const { getReactNativePersistence } = require("@firebase/auth") as {
  getReactNativePersistence: (storage: unknown) => Persistence;
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const authInstance: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(
    createAsyncStorage("cozmic-wallpapers"),
  ),
});
const dbInstance: Firestore = getFirestore(app);
const functionsInstance: Functions = getFunctions(app);
const storageInstance: FirebaseStorage = getStorage(app);
const firebaseEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;

if (__DEV__ && firebaseEmulatorHost) {
  connectAuthEmulator(authInstance, `http://${firebaseEmulatorHost}:9099`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(dbInstance, firebaseEmulatorHost, 8000);
  connectFunctionsEmulator(functionsInstance, firebaseEmulatorHost, 5001);
  connectStorageEmulator(storageInstance, firebaseEmulatorHost, 9199);
}

export const firebaseApp = app;
export const auth = authInstance;
export const db = dbInstance;
export const functions = functionsInstance;
export const storage = storageInstance;
