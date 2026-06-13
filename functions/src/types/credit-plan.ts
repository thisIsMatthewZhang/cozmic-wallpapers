export const PRODUCT_IDS = ["planet", "star", "galaxy", "universe"] as const;

export const CREDIT_PLANS = {
  planet: { credits: 60 },
  star: { credits: 180 },
  galaxy: { credits: 420 },
  universe: { credits: 900 },
} as const satisfies Record<typeof PRODUCT_IDS[number], { credits: number }>;

export type CreditPlan = {
  id: typeof PRODUCT_IDS[number];
  name: string;
  price: string;
  credits: number;
  description: string;
  badge?: string;
  accent: string;
  features: string[];
};
