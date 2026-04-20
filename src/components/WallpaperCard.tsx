import { StyleSheet, Text, View } from "react-native";

import { colors, radii, typography } from "../constants/theme";
import type { WallpaperPreview } from "../types/wallpaper";

type WallpaperCardProps = {
  item: WallpaperPreview;
  compact?: boolean;
};

export function WallpaperCard({
  item,
  compact = false,
}: WallpaperCardProps) {
  return (
    <View
      style={[
        styles.card,
        compact ? styles.compactCard : styles.largeCard,
        { backgroundColor: item.colors[0] },
      ]}
    >
      <View
        style={[
          styles.gradientBlob,
          { backgroundColor: item.colors[1], borderColor: item.accent },
        ]}
      />
      <View style={[styles.planet, { backgroundColor: item.accent }]} />
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "flex-end",
  },
  largeCard: {
    height: 188,
    padding: 18,
  },
  compactCard: {
    height: 136,
    padding: 16,
  },
  gradientBlob: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -56,
    right: -40,
    opacity: 0.45,
    borderWidth: 1,
  },
  planet: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 33,
    top: 22,
    left: 20,
    opacity: 0.85,
  },
  copy: {
    gap: 6,
  },
  title: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.cloud,
    fontSize: typography.body,
    lineHeight: 20,
    maxWidth: "88%",
  },
});
