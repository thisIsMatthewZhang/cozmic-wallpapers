import type { Timestamp } from "firebase/firestore";

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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
};
