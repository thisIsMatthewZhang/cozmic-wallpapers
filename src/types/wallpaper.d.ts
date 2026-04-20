export type GeneratorPreset = {
  id: string;
  label: string;
  accent: string;
};

export type WallpaperStyle = {
  id: string;
  label: string;
};

export type AspectRatioOption = {
  id: string;
  label: string;
  description: string;
};

export type WallpaperPreview = {
  id: string;
  title: string;
  subtitle: string;
  colors: [string, string];
  accent: string;
};
