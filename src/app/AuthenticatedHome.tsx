import { useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ChoiceChip } from "../components/ChoiceChip";
import { PromptComposer } from "../components/PromptComposer";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/SectionHeader";
import { WallpaperCard } from "../components/WallpaperCard";
import { colors, radii, typography } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { usePromptSuggestion } from "../hooks/usePromptSuggestion";
import {
  featuredWallpapers,
  presets,
  ratios,
  recentGenerations,
  wallpaperStyles,
} from "../utils/mockData";
import { DownloadPlansScreen } from "./DownloadPlansScreen";

type ActiveScreen = "create" | "plans";

export function AuthenticatedHome() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("create");
  const [selectedPreset, setSelectedPreset] = useState(presets[0].id);
  const [selectedStyle, setSelectedStyle] = useState(wallpaperStyles[0].id);
  const [selectedRatio, setSelectedRatio] = useState(ratios[0].id);
  const { suggestion, cycleSuggestion } = usePromptSuggestion();
  const { user, signOutUser } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Explorer";

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScreenShell>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome back</Text>
            <Text style={styles.welcomeValue}>{displayName}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable
              onPress={() => setActiveScreen("plans")}
              style={[
                styles.topButton,
                activeScreen === "plans" && styles.topButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.topButtonLabel,
                  activeScreen === "plans" && styles.topButtonLabelActive,
                ]}
              >
                Plans
              </Text>
            </Pressable>
            <Pressable onPress={signOutUser} style={styles.topButton}>
              <Text style={styles.topButtonLabel}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        {activeScreen === "plans" ? (
          <DownloadPlansScreen onBack={() => setActiveScreen("create")} />
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>COZMIC WALLPAPERS</Text>
                <Text style={styles.headline}>
                  Craft stellar lock screens with AI-built scenes.
                </Text>
                <Text style={styles.subheadline}>
                  Generate original planets, galaxies, and deep-space moods tuned
                  for mobile wallpaper framing.
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statPill, styles.freeStatPill]}>
                  <Text style={[styles.statValue, styles.freeStatValue]}>
                    Free
                  </Text>
                  <Text style={styles.statLabel}>first download</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>4K</Text>
                  <Text style={styles.statLabel}>upscale ready</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>12s</Text>
                  <Text style={styles.statLabel}>average render</Text>
                </View>
              </View>
            </View>

            <PromptComposer initialPrompt={suggestion} onRemix={cycleSuggestion} />

            <View style={styles.sectionBlock}>
              <SectionHeader
                eyebrow="Preset Engine"
                title="Start from a generation preset"
                description="Each preset nudges composition, contrast, and subject scale for better wallpaper layouts."
              />
              <View style={styles.rowWrap}>
                {presets.map((preset) => (
                  <ChoiceChip
                    key={preset.id}
                    accent={preset.accent}
                    label={preset.label}
                    onPress={() => setSelectedPreset(preset.id)}
                    selected={selectedPreset === preset.id}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader
                eyebrow="Look & Feel"
                title="Dial in the visual style"
                description="Keep the prompt flexible while letting the renderer lock onto a visual direction."
              />
              <View style={styles.rowWrap}>
                {wallpaperStyles.map((styleOption) => (
                  <ChoiceChip
                    key={styleOption.id}
                    label={styleOption.label}
                    onPress={() => setSelectedStyle(styleOption.id)}
                    selected={selectedStyle === styleOption.id}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader
                eyebrow="Canvas"
                title="Choose output framing"
                description="Different crops for lock screens, story-friendly exports, and square previews."
              />
              <View style={styles.aspectRow}>
                {ratios.map((ratio) => {
                  const active = selectedRatio === ratio.id;

                  return (
                    <Pressable
                      key={ratio.id}
                      onPress={() => setSelectedRatio(ratio.id)}
                      style={[
                        styles.aspectCard,
                        active && styles.aspectCardActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.aspectLabel,
                          active && styles.aspectLabelActive,
                        ]}
                      >
                        {ratio.label}
                      </Text>
                      <Text style={styles.aspectDescription}>
                        {ratio.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeader
                eyebrow="Featured"
                title="Inspiration from recent cosmic moods"
                description="A first-pass gallery to show the kind of visual directions the generator can support."
              />
              <View style={styles.cardColumn}>
                {featuredWallpapers.map((item) => (
                  <WallpaperCard key={item.id} item={item} />
                ))}
              </View>
            </View>

            <View style={styles.queuePanel}>
              <SectionHeader
                eyebrow="Queue"
                title="Recent generations"
                description="A preview of how history and job status could feel inside the app."
              />
              <View style={styles.cardColumn}>
                {recentGenerations.map((item) => (
                  <WallpaperCard compact key={item.id} item={item} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcomeLabel: {
    color: colors.mist,
    fontSize: typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  welcomeValue: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "700",
    marginTop: 4,
  },
  topButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.panelSoft,
  },
  topButtonActive: {
    borderColor: colors.cyan,
    backgroundColor: "rgba(114, 228, 255, 0.12)",
  },
  topButtonLabel: {
    color: colors.cloud,
    fontSize: 13,
    fontWeight: "700",
  },
  topButtonLabelActive: {
    color: colors.cyan,
  },
  hero: {
    paddingTop: 10,
    paddingHorizontal: 2,
    paddingBottom: 4,
    gap: 18,
  },
  heroCopy: {
    gap: 10,
  },
  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  headline: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 38,
    maxWidth: "92%",
    textShadowColor: "rgba(2, 8, 22, 0.75)",
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 18,
  },
  subheadline: {
    color: colors.cloud,
    fontSize: typography.body,
    lineHeight: 23,
    maxWidth: "95%",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.panelBright,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    gap: 6,
  },
  freeStatPill: {
    borderColor: "rgba(126, 247, 198, 0.45)",
    backgroundColor: "rgba(126, 247, 198, 0.1)",
  },
  statValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  freeStatValue: {
    color: colors.success,
  },
  statLabel: {
    color: colors.mist,
    fontSize: typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionBlock: {
    gap: 14,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  aspectRow: {
    flexDirection: "row",
    gap: 12,
  },
  aspectCard: {
    flex: 1,
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
    gap: 6,
  },
  aspectCardActive: {
    borderColor: colors.cyan,
    backgroundColor: "rgba(114, 228, 255, 0.1)",
  },
  aspectLabel: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "700",
  },
  aspectLabelActive: {
    color: colors.cyan,
  },
  aspectDescription: {
    color: colors.mist,
    fontSize: 13,
    lineHeight: 18,
  },
  cardColumn: {
    gap: 14,
  },
  queuePanel: {
    gap: 14,
    padding: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(8, 20, 39, 0.8)",
  },
});
