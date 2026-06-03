export type GenerationJobStatus = "queued" | "processing" | "complete" | "failed";
const VALID_ASPECT_RATIOS = ["9:16" , "16:9" , "3:4" , "4:3" , "2:3" , "3:2" , "1:1"] as const;

export type GenerationJob = {
  jobId: string;
  uid: string;
  prompt: string;
  resolution: string;
  numberOfImages: number;
  creditCost: number;
  aspectRatio: keyof typeof VALID_ASPECT_RATIOS,
  status: GenerationJobStatus;
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  imagePaths?: string[];
  errorMessage?: string;
};
