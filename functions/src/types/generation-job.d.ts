export type GenerationJobStatus = "queued" | "processing" | "complete" | "failed";

export type GenerationJob = {
  uid: string;
  prompt: string;
  resolution: string;
  credits: number;
  status: GenerationJobStatus;
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  imagePath?: string;
  errorMessage?: string;
};
