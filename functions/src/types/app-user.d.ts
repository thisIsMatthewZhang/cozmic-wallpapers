import type { FieldValue, Timestamp } from "firebase-admin/firestore";

export type AppUser = {
  uid: string;
  creditBalance: number;
  totalGenerations: number;
  generatedJobIds: string[];
  generatedImagePaths: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastLoginAt?: Timestamp | FieldValue;
};
