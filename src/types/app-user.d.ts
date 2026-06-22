import type { Timestamp } from "firebase/firestore";

export type AppUser = {
  uid: string;
  creditBalance: number;
  totalGenerations: number;
  generatedJobIds: string[];
  generatedImagePaths: string[];
  storageRootPath: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
};
