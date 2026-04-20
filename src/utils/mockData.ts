import type {
  AspectRatioOption,
  GeneratorPreset,
  WallpaperPreview,
  WallpaperStyle,
} from "../types/wallpaper";

export const presets: GeneratorPreset[] = [
  { id: "nebula", label: "Nebula Bloom", accent: "#72E4FF" },
  { id: "planet", label: "Planet Portrait", accent: "#FFD166" },
  { id: "cluster", label: "Star Cluster", accent: "#FF8C7A" },
  { id: "aurora", label: "Cosmic Aurora", accent: "#8597FF" },
];

export const styles: WallpaperStyle[] = [
  { id: "photoreal", label: "Photoreal" },
  { id: "dreamy", label: "Dreamy" },
  { id: "minimal", label: "Minimal" },
  { id: "retro", label: "Retro Futurism" },
  { id: "epic", label: "Epic Matte" },
];

export const ratios: AspectRatioOption[] = [
  { id: "phone", label: "9:19.5", description: "Modern phones" },
  { id: "classic", label: "9:16", description: "Stories and lock screens" },
  { id: "square", label: "1:1", description: "Social previews" },
];

export const featuredWallpapers: WallpaperPreview[] = [
  {
    id: "veil",
    title: "Veil of Andromeda",
    subtitle: "Soft dust lanes with electric cyan haze",
    colors: ["#071828", "#14304F"],
    accent: "#72E4FF",
  },
  {
    id: "forge",
    title: "Solar Forge",
    subtitle: "Molten star light around a fractured ring",
    colors: ["#1C1124", "#4A1C1C"],
    accent: "#FF8C7A",
  },
  {
    id: "drift",
    title: "Orbital Drift",
    subtitle: "A quiet moon crossing violet turbulence",
    colors: ["#07111B", "#1B2957"],
    accent: "#8597FF",
  },
];

export const recentGenerations: WallpaperPreview[] = [
  {
    id: "crown",
    title: "Crown Nebula",
    subtitle: "Queued 8 min ago",
    colors: ["#091525", "#1B5A6B"],
    accent: "#7EF7C6",
  },
  {
    id: "ember",
    title: "Ember Saturn",
    subtitle: "Upscaled and ready",
    colors: ["#180E19", "#4F2831"],
    accent: "#FFD166",
  },
];

export const promptIdeas = [
  "A cinematic exoplanet with glowing oceans, seen from low orbit",
  "Dense galaxy bloom with fine stardust and a single radiant core",
  "Minimal moonscape with teal eclipse light and negative space",
  "Retro-futurist ringed planet drifting through coral and gold gas clouds",
];
