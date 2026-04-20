import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, typography } from "../constants/theme";

type PromptComposerProps = {
  initialPrompt: string;
  onRemix: () => void;
};

export function PromptComposer({
  initialPrompt,
  onRemix,
}: PromptComposerProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>Prompt Lab</Text>
        </View>
        <Pressable onPress={onRemix} style={styles.remixButton}>
          <Text style={styles.remixLabel}>Remix Idea</Text>
        </Pressable>
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

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.footerLabel}>Estimated render</Text>
          <Text style={styles.footerValue}>12 sec • 4 variants</Text>
        </View>
        <Pressable style={styles.generateButton}>
          <Text style={styles.generateLabel}>Generate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 16,
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
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
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
    borderColor: colors.line,
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
  },
  generateLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800",
  },
});
