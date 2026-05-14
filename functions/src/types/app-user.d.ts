import type { FieldValue, Timestamp } from "firebase-admin/firestore";

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  emailVerified: boolean;
  creditBalance: number;
  totalGenerations: number;
  generatedJobIds: string[];
  generatedImagePaths: string[];
  storageRootPath: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastLoginAt?: Timestamp | FieldValue;
};
