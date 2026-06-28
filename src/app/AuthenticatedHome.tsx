import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

import AppButton from "../components/AppButton";
import { ChoiceChip } from "../components/ChoiceChip";
import { GenerationHistoryGridModal } from "../components/GenerationHistoryGridModal";
import { ProfileInfoModal } from "../components/ProfileInfoModal";
import { PromptComposer } from "../components/PromptComposer";
import ReusableModal from "../components/ReusableModal";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/SectionHeader";
import { WallpaperCard } from "../components/WallpaperCard";
import { WallpaperRedownloadModal } from "../components/WallpaperRedownloadModal";
import { colors, radii, typography } from "../constants/theme";
import { useAppUser } from "../contexts/AppUserContext";
import { usePromptSuggestion } from "../hooks/usePromptSuggestion";
import type { WallpaperPreview } from "../types/wallpaper";
import { db, storage } from "../utils/firebase";
import {
  featuredWallpapers,
  presets,
  wallpaperStyles,
} from "../utils/mockData";
import { DownloadPlansScreen } from "./DownloadPlansScreen";

type AuthenticatedHomeProps = {
  onGenerationComplete: (images: string[]) => void;
};

type GenerationHistoryDocument = {
  aspectRatio?: unknown;
  createdAt?: unknown;
  imagePaths?: unknown;
  numberOfImages?: unknown;
  prompt?: unknown;
  resolution?: unknown;
  status?: unknown;
};

const HISTORY_CARD_LIMIT = 5;
const historyPalettes: Array<Pick<WallpaperPreview, "accent" | "colors">> = [
  { accent: "#72E4FF", colors: ["#071828", "#14304F"] },
  { accent: "#FFD166", colors: ["#180E19", "#4F2831"] },
  { accent: "#7EF7C6", colors: ["#091525", "#1B5A6B"] },
  { accent: "#8597FF", colors: ["#07111B", "#1B2957"] },
  { accent: "#FF8C7A", colors: ["#1C1124", "#4A1C1C"] },
];

function timestampToDate(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate() as Date;
  }

  return null;
}

function formatHistoryTime(value: unknown) {
  const date = timestampToDate(value);
  if (!date) return "Generated recently";

  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );
  if (elapsedMinutes < 1) return "Generated just now";
  if (elapsedMinutes < 60) {
    return `Generated ${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `Generated ${elapsedHours} hr ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `Generated ${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}

function formatHistoryTitle(prompt: unknown, fallback: string) {
  if (typeof prompt !== "string" || !prompt.trim()) return fallback;

  const trimmedPrompt = prompt.trim();
  return trimmedPrompt.length > 52
    ? `${trimmedPrompt.slice(0, 49)}...`
    : trimmedPrompt;
}

function formatHistorySubtitle(job: GenerationHistoryDocument) {
  const parts = [formatHistoryTime(job.createdAt)];

  if (typeof job.resolution === "string") {
    parts.push(job.resolution);
  }
  if (typeof job.numberOfImages === "number") {
    parts.push(`${job.numberOfImages} image${job.numberOfImages === 1 ? "" : "s"}`);
  }

  return parts.join(" - ");
}

function getImagePaths(imagePaths: unknown) {
  if (!Array.isArray(imagePaths)) return [];

  return imagePaths.filter((path): path is string => typeof path === "string");
}

function mapHistoryDocument(
  id: string,
  data: GenerationHistoryDocument,
  index: number,
  imageUri?: string,
  imageIndex?: number,
): WallpaperPreview {
  const palette = historyPalettes[index % historyPalettes.length];

  return {
    id: imageIndex === undefined ? id : `${id}-${imageIndex}`,
    title: formatHistoryTitle(data.prompt, `Generation ${index + 1}`),
    subtitle: formatHistorySubtitle(data),
    imageUri,
    ...palette,
  };
}

function ProfileIcon() {
  return (
    <View style={styles.profileIcon}>
      <View style={styles.profileIconHead} />
      <View style={styles.profileIconBody} />
    </View>
  );
}

export function AuthenticatedHome({
  onGenerationComplete,
}: Readonly<AuthenticatedHomeProps>) {
  const [showPacksModal, setShowPacksModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryImage, setSelectedHistoryImage] =
    useState<WallpaperPreview | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(presets[0].id);
  const [selectedStyle, setSelectedStyle] = useState(wallpaperStyles[0].id);
  const [generationHistory, setGenerationHistory] = useState<WallpaperPreview[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const { suggestion, cycleSuggestion } = usePromptSuggestion();
  const { uid } = useAppUser();
  const selectedPresetLabel =
    presets.find((preset) => preset.id === selectedPreset)?.label ??
    presets[0].label;
  const selectedStyleLabel =
    wallpaperStyles.find((styleOption) => styleOption.id === selectedStyle)
      ?.label ?? wallpaperStyles[0].label;
  const recentGenerationHistory = generationHistory.slice(0, HISTORY_CARD_LIMIT);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: Unsubscribe | undefined;

    if (!uid) {
      setGenerationHistory([]);
      setIsHistoryLoading(false);
      return undefined;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    const historyQuery = query(
      collection(db, "generationJobs"),
      where("uid", "==", uid),
      where("status", "==", "complete"),
      orderBy("createdAt", "desc"),
    );

    unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        void Promise.all(
          snapshot.docs.map(async (docSnapshot, index) => {
            const data = docSnapshot.data() as GenerationHistoryDocument;
            const imagePaths = getImagePaths(data.imagePaths);

            if (!imagePaths.length) {
              return [mapHistoryDocument(docSnapshot.id, data, index)];
            }

            const items = await Promise.all(
              imagePaths.map(async (imagePath, imageIndex) => {
                const imageUri = await getDownloadURL(
                  ref(storage, imagePath),
                ).catch(() => undefined);

                return mapHistoryDocument(
                  docSnapshot.id,
                  data,
                  index,
                  imageUri,
                  imageIndex,
                );
              }),
            );

            return items;
          }),
        ).then((items) => {
          if (!isActive) return;
          setGenerationHistory(items.flat());
          setHistoryError(null);
          setIsHistoryLoading(false);
        });
      },
      () => {
        if (!isActive) return;
        setGenerationHistory([]);
        setHistoryError("Unable to load recent generations.");
        setIsHistoryLoading(false);
      },
    );

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [uid]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ScreenShell>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.welcomeLabel}>Launch Pad</Text>
            <Text style={styles.welcomeValue}>Cozmic Wallpapers</Text>
          </View>
          <View style={styles.topActions}>
            <AppButton
              bgColor={
                showPacksModal
                  ? "rgba(114, 228, 255, 0.12)"
                  : colors.panelSoft
              }
              customStyle={[
                styles.topButton,
                showPacksModal && styles.topButtonActive,
              ]}
              onPress={() => setShowPacksModal(true)}
              textColor={showPacksModal ? colors.cyan : colors.cloud}
              textStyle={[
                styles.topButtonLabel,
                showPacksModal && styles.topButtonLabelActive,
              ]}
              title="Credit Packs"
            />
            <Pressable
              accessibilityLabel="Open profile and app information"
              accessibilityRole="button"
              onPress={() => setShowProfileModal(true)}
              style={[
                styles.profileButton,
                showProfileModal && styles.profileButtonActive,
              ]}
            >
              <ProfileIcon />
            </Pressable>
          </View>
        </View>

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
            <View style={styles.statPill}>
              <Text style={styles.statValue}>Free</Text>
              <Text style={styles.statLabel}>downloads</Text>
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

        <PromptComposer
          initialPrompt={suggestion}
          onGenerationComplete={onGenerationComplete}
          onRemix={cycleSuggestion}
          selectedPresetLabel={selectedPresetLabel}
          selectedStyleLabel={selectedStyleLabel}
        />

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
            eyebrow="History"
            title="Recent generations"
            description="Your latest completed wallpapers are saved to this device's generated app user ID."
          />
          {isHistoryLoading ? (
            <Text style={styles.historyMessage}>Loading recent generations...</Text>
          ) : historyError ? (
            <Text style={styles.historyError}>{historyError}</Text>
          ) : recentGenerationHistory.length ? (
            <>
              <View style={styles.cardColumn}>
                {recentGenerationHistory.map((item) => (
                  <WallpaperCard
                    compact
                    key={item.id}
                    item={item}
                    showTextOverlay={!item.imageUri}
                  />
                ))}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowHistoryModal(true)}
                style={styles.historyGridLink}
              >
                <Text style={styles.historyGridLinkText}>
                  View all generated wallpapers
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.historyMessage}>
              Completed wallpapers will appear here after your first generation.
            </Text>
          )}
        </View>
      </ScreenShell>
      <ReusableModal
        showModal={showPacksModal}
        setShowModal={setShowPacksModal}
        modalProps={{
          transparent: true,
          presentationStyle: "overFullScreen",
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close download plans"
            onPress={() => setShowPacksModal(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalSheet}>
            <DownloadPlansScreen onClose={() => setShowPacksModal(false)} />
          </View>
        </View>
      </ReusableModal>
      <GenerationHistoryGridModal
        images={generationHistory}
        onImagePress={(image) => {
          setSelectedHistoryImage(image);
          setShowHistoryModal(false);
        }}
        setShowModal={setShowHistoryModal}
        showModal={showHistoryModal}
      />
      <WallpaperRedownloadModal
        image={selectedHistoryImage}
        setShowModal={(showModal) => {
          if (!showModal) {
            setSelectedHistoryImage(null);
          }
        }}
        showModal={selectedHistoryImage !== null}
      />
      <ProfileInfoModal
        setShowModal={setShowProfileModal}
        showModal={showProfileModal}
        uid={uid}
      />
    </KeyboardAvoidingView>
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
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
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
  profileButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
  },
  profileButtonActive: {
    borderColor: colors.cyan,
    backgroundColor: "rgba(114, 228, 255, 0.12)",
  },
  profileIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
  },
  profileIconHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cloud,
  },
  profileIconBody: {
    width: 18,
    height: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: colors.cloud,
    marginTop: 3,
  },
  hero: {
    paddingTop: 10,
    paddingHorizontal: 2,
    paddingBottom: 12,
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
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.panelBright,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    gap: 6,
  },
  statValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
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
  historyMessage: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
  historyError: {
    color: colors.coral,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 21,
  },
  historyGridLink: {
    alignSelf: "flex-start",
    paddingVertical: 2,
  },
  historyGridLinkText: {
    color: colors.cyan,
    fontSize: typography.body,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 8, 22, 0.68)",
  },
  modalSheet: {
    maxHeight: "85%",
    overflow: "hidden",
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.lineStrong,
    backgroundColor: colors.ink,
  },
});
