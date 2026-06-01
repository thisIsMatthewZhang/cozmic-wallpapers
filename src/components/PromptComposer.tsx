import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageSourcePropType,
} from "react-native";
import AppButton from "./AppButton";
import { ChoiceChip } from "./ChoiceChip";
import { httpsCallable } from "firebase/functions";
import { onSnapshot, doc } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db, functions } from "@/src/utils/firebase";
import { colors, radii, typography } from "../constants/theme";
import { CREDIT_COST_MAPPING } from "../constants/resolution-credit-mapping";


type CreditCostMappingType = keyof typeof CREDIT_COST_MAPPING;
type PromptComposerProps = {
  initialPrompt: string;
  onGenerationComplete: (images: string[]) => void;
  onRemix: () => void;
};
type GenerationJobId = {
  jobId: string
}
type GenerationJobStatus = "idle" | "queued" | "processing" | "complete" | "failed";

const MIN_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 5;
const resolutionOptions = Object.entries(CREDIT_COST_MAPPING).map(
  ([resolution, credits]) => ({
    resolution: resolution as CreditCostMappingType,
    credits,
  }),
);

const generationStatusCopy: Record<
  Exclude<GenerationJobStatus, "idle">,
  { label: string; message: string }
> = {
  queued: {
    label: "Queued",
    message: "Your wallpaper job is waiting for the next render slot.",
  },
  processing: {
    label: "Processing",
    message: "Gemini is building your cosmic wallpaper now.",
  },
  complete: {
    label: "Complete",
    message: "Your wallpaper is ready.",
  },
  failed: {
    label: "Failed",
    message: "We could not complete this generation. Try again in a moment.",
  },
};

const normalizeImageSources = (imagePaths: string[]): ImageSourcePropType[] => {
  return imagePaths.map((imagePath) => ({ uri: imagePath }));
};

export function PromptComposer({
  initialPrompt,
  onGenerationComplete,
  onRemix,
}: Readonly<PromptComposerProps>) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generationStatus, setGenerationStatus] =
    useState<GenerationJobStatus>("idle");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [numberOfImages, setNumberOfImages] = useState("1");
  const [requestedResolution, setRequestedResolution] = useState<CreditCostMappingType>("1K");
  const unsubscribeJobRef = useRef<Unsubscribe | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      unsubscribeJobRef.current?.();
    };
  }, []);

  const isGenerating =
    generationStatus === "queued" || generationStatus === "processing";
  const generationStatusInfo =
    generationStatus === "idle" ? null : generationStatusCopy[generationStatus];
  const parsedImageCount = Number.parseInt(numberOfImages, 10);
  const requestedImageCount = Number.isNaN(parsedImageCount)
    ? MIN_IMAGE_COUNT
    : Math.min(Math.max(parsedImageCount, MIN_IMAGE_COUNT), MAX_IMAGE_COUNT);

  const handleImageCountChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setNumberOfImages(digitsOnly);
  };

  const normalizeImageCount = () => {
    setNumberOfImages(String(requestedImageCount));
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) {
      return;
    }

    unsubscribeJobRef.current?.();
    setGenerationStatus("queued");
    setActiveJobId(null);

    const startGenerationJob = httpsCallable<
      { prompt: string; numberOfImages: number, requestedResolution: CreditCostMappingType },
      GenerationJobId
    >(functions, "startGenerationJob");

    startGenerationJob({ prompt, numberOfImages: requestedImageCount, requestedResolution })
      .then((result) => {
        if (!isMountedRef.current) return;
        const jobId = result.data.jobId;
        setActiveJobId(jobId);

        const jobRef = doc(db, "generationJobs", jobId);
        unsubscribeJobRef.current = onSnapshot(
          jobRef,
          (snapshot) => {
            if (!isMountedRef.current) return;
            const job = snapshot.data();
            if (!job) return;

            if (job.status === "queued" || job.status === "processing") {
              setGenerationStatus(job.status);
              return;
            }

            if (job.status === "complete") {
              setGenerationStatus("complete");
              onGenerationComplete(job.imagePaths ?? []);
              unsubscribeJobRef.current?.();
              unsubscribeJobRef.current = null;
              return;
            }

            if (job.status === "failed") {
              setGenerationStatus("failed");
              unsubscribeJobRef.current?.();
              unsubscribeJobRef.current = null;
            }
          },
          () => {
            if (!isMountedRef.current) return;
            setGenerationStatus("failed");
            unsubscribeJobRef.current = null;
          },
        );
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        setGenerationStatus("failed");
      });
  };

  return (
    <View style={styles.panel}>
      <View style={styles.ambientRing} />
      <View style={styles.ambientGlow} />

      <View style={styles.headerRow}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>Prompt Lab</Text>
        </View>
        <AppButton
          bgColor="rgba(255,255,255,0.04)"
          customStyle={styles.remixButton}
          onPress={onRemix}
          textColor={colors.white}
          textStyle={styles.remixLabel}
          title="Remix Idea"
        />
      </View>

      <Text style={styles.title}>Describe the universe you want</Text>
      <Text style={styles.description}>
        Start with a scene, then layer mood, lighting, and texture for a more
        vivid wallpaper result.
      </Text>

      <TextInput
        multiline
        onChangeText={setPrompt}
        placeholder="A moonlit nebula over a crystalline planet..."
        placeholderTextColor={colors.mist}
        style={styles.input}
        value={prompt}
      />

      <View style={styles.settingsRow}>
        <View style={styles.imageCountCopy}>
          <Text style={styles.footerLabel}>Images</Text>
          <Text style={styles.settingDescription}>
            Generate up to {MAX_IMAGE_COUNT} options in one batch.
          </Text>
        </View>
        <TextInput
          keyboardType="number-pad"
          maxLength={1}
          onBlur={normalizeImageCount}
          onChangeText={handleImageCountChange}
          placeholder="1"
          placeholderTextColor={colors.mist}
          selectTextOnFocus
          style={styles.imageCountInput}
          value={numberOfImages}
        />
      </View>

      <View style={styles.resolutionPanel}>
        <View style={styles.resolutionHeader}>
          <View style={styles.imageCountCopy}>
            <Text style={styles.footerLabel}>Resolution</Text>
            <Text style={styles.settingDescription}>
              Higher resolutions use more credits per image.
            </Text>
          </View>
          <Text style={styles.creditCostLabel}>
            {CREDIT_COST_MAPPING[requestedResolution]} credits
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.resolutionOptions}
        >
          {resolutionOptions.map((option) => (
            <ChoiceChip
              key={option.resolution}
              label={option.resolution}
              onPress={() => setRequestedResolution(option.resolution)}
              selected={requestedResolution === option.resolution}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.footerLabel}>Estimated render</Text>
          <Text style={styles.footerValue}>12 sec / 4 variants</Text>
        </View>
        <AppButton
          bgColor={colors.cyan}
          customStyle={styles.generateButton}
          isLoading={isGenerating}
          loadingColor={colors.ink}
          onPress={handleGenerate}
          pressableProps={{ disabled: isGenerating }}
          textColor={colors.ink}
          textStyle={styles.generateLabel}
          title={isGenerating ? "Generating" : "Generate"}
        />
      </View>

      {generationStatusInfo ? (
        <View style={styles.jobStatusPanel}>
          <View style={styles.jobStatusIcon}>
            {isGenerating ? (
              <ActivityIndicator color={colors.cyan} />
            ) : (
              <View
                style={[
                  styles.jobStatusDot,
                  generationStatus === "failed" && styles.jobStatusDotFailed,
                ]}
              />
            )}
          </View>
          <View style={styles.jobStatusCopy}>
            <Text style={styles.jobStatusLabel}>
              {generationStatusInfo.label}
            </Text>
            <Text style={styles.jobStatusMessage}>
              {generationStatusInfo.message}
            </Text>
            {activeJobId ? (
              <Text style={styles.jobStatusId}>Job {activeJobId}</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: "hidden",
    backgroundColor: colors.panelBright,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    padding: 18,
    gap: 16,
  },
  ambientRing: {
    position: "absolute",
    top: -48,
    right: -26,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(216, 228, 242, 0.08)",
    transform: [{ scaleX: 1.35 }, { rotate: "-24deg" }],
  },
  ambientGlow: {
    position: "absolute",
    bottom: -60,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(114, 228, 255, 0.08)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(114, 228, 255, 0.1)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveLabel: {
    color: colors.cloud,
    fontSize: typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  remixButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  remixLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    color: colors.white,
    fontSize: typography.headline,
    fontWeight: "800",
    lineHeight: 28,
  },
  description: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
  input: {
    minHeight: 126,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.overlay,
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
    fontSize: typography.body,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.overlay,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  imageCountCopy: {
    flex: 1,
    gap: 4,
  },
  settingDescription: {
    color: colors.mist,
    fontSize: 13,
    lineHeight: 18,
  },
  imageCountInput: {
    width: 58,
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  resolutionPanel: {
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.overlay,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resolutionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  creditCostLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  resolutionOptions: {
    gap: 10,
  },
  footerLabel: {
    color: colors.mist,
    fontSize: typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerValue: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "600",
    marginTop: 3,
  },
  generateButton: {
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  generateLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800",
  },
  jobStatusPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(8, 20, 39, 0.72)",
    padding: 14,
  },
  jobStatusIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "rgba(114, 228, 255, 0.1)",
  },
  jobStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  jobStatusDotFailed: {
    backgroundColor: colors.coral,
  },
  jobStatusCopy: {
    flex: 1,
    gap: 3,
  },
  jobStatusLabel: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "800",
  },
  jobStatusMessage: {
    color: colors.cloud,
    fontSize: 13,
    lineHeight: 18,
  },
  jobStatusId: {
    color: colors.mist,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: 3,
    textTransform: "uppercase",
  },
});
