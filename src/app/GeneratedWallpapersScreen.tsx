import { useEffect, useRef } from "react";
import {
  Animated,
  ImageSourcePropType,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/src/components/AppButton";
import AppCarousel from "@/src/components/AppCarousel";
import { ScreenShell } from "@/src/components/ScreenShell";
import { colors, radii, typography } from "@/src/constants/theme";

type GeneratedWallpapersScreenProps = {
  images: ImageSourcePropType[];
  onBack: () => void;
};

export function GeneratedWallpapersScreen({
  images,
  onBack,
}: Readonly<GeneratedWallpapersScreenProps>) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScreenShell>
        <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
          <View style={styles.topBar}>
            <View style={styles.titleGroup}>
              <Text style={styles.kicker}>Images Ready</Text>
              <Text style={styles.title}>Your wallpaper options</Text>
            </View>
            <AppButton
              bgColor={colors.panelSoft}
              customStyle={styles.backButton}
              onPress={onBack}
              textColor={colors.cloud}
              textStyle={styles.backButtonLabel}
              title="Back"
            />
          </View>

          {images.length ? (
            <View style={styles.previewPanel}>
              <AppCarousel data={images} />
            </View>
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyTitle}>No previews returned</Text>
              <Text style={styles.emptyCopy}>
                The render finished, but the job did not include image paths.
              </Text>
            </View>
          )}

          <View style={styles.summaryPanel}>
            <Text style={styles.summaryValue}>{images.length}</Text>
            <Text style={styles.summaryLabel}>
              {images.length === 1
                ? "wallpaper generated"
                : "wallpapers generated"}
            </Text>
          </View>
        </Animated.View>
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  titleGroup: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: typography.headline,
    fontWeight: "900",
    lineHeight: 30,
  },
  backButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.panelSoft,
  },
  backButtonLabel: {
    color: colors.cloud,
    fontSize: 13,
    fontWeight: "700",
  },
  previewPanel: {
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.ink,
    paddingVertical: 18,
  },
  emptyPanel: {
    gap: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
    padding: 18,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "800",
  },
  emptyCopy: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
  summaryPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(8, 20, 39, 0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryValue: {
    color: colors.cyan,
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: colors.cloud,
    fontSize: typography.body,
    fontWeight: "700",
  },
});
