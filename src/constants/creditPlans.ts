import type { CreditPlan } from "../types/wallpaper";

export const creditPlans: CreditPlan[] = [
  {
    id: "planet",
    name: "Planet Pack",
    price: "$3.99",
    credits: 60,
    description: "A starter pack for testing prompts and saving a small set of finished wallpapers.",
    accent: "#72E4FF",
    features: [
      "10 images at 1K",
      "7 images at 2K",
      "5 images at 4K",
    ],
  },
  {
    id: "star",
    name: "Star Pack",
    price: "$7.99",
    credits: 180,
    description: "A balanced pack for weekly cosmic wallpaper creation and remixing.",
    badge: "Best value",
    accent: "#FFD166",
    features: [
      "30 images at 1K",
      "22 images at 2K",
      "15 images at 4K",
    ],
  },
  {
    id: "galaxy",
    name: "Galaxy Pack",
    price: "$14.99",
    credits: 420,
    description: "A larger credit bank for collectors, batches, and higher-resolution experiments.",
    accent: "#FF8C7A",
    features: [
      "70 images at 1K",
      "52 images at 2K",
      "35 images at 4K",
    ],
  },
  {
    id: "universe",
    name: "Universe Pack",
    price: "$29.99",
    credits: 900,
    description: "The deepest pack for frequent creators and max-resolution wallpaper collections.",
    accent: "#7EF7C6",
    features: [
      "150 images at 1K",
      "112 images at 2K",
      "75 images at 4K",
    ],
  },
];
