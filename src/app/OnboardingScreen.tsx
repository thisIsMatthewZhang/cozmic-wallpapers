import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, typography } from "../constants/theme";

type OnboardingStep = "welcome" | "credits";

type OnboardingScreenProps = {
  onContinue: () => void;
  step: OnboardingStep;
};

const creditCosts = [
  { label: "1K", value: "6 credits" },
  { label: "2K", value: "8 credits" },
  { label: "4K", value: "12 credits" },
];

function ShootingStar() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shootingStar,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.08, 0.78, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-120, 230],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [60, -80],
              }),
            },
            { rotate: "-24deg" },
          ],
        },
      ]}
    >
      <View style={styles.starTrail} />
      <View style={styles.starHead} />
    </Animated.View>
  );
}

export function OnboardingScreen({
  onContinue,
  step,
}: Readonly<OnboardingScreenProps>) {
  const isWelcome = step === "welcome";

  return (
    <ScreenShell>
      <View style={styles.stage}>
        <View style={styles.visualPanel}>
          <View style={styles.orbitLarge} />
          <View style={styles.orbitSmall} />
          <View style={styles.planetRingBack} />
          <View style={styles.planet}>
            <View style={styles.planetShadow} />
            <View style={styles.planetGlow} />
            <View style={styles.planetBand} />
          </View>
          <View style={styles.planetRingFrontClip}>
            <View style={styles.planetRingFront} />
          </View>
          <View style={styles.starOne} />
          <View style={styles.starTwo} />
          <View style={styles.starThree} />
          <ShootingStar />
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.kicker}>
            {isWelcome ? "WELCOME ABOARD" : "CREDIT SYSTEM"}
          </Text>
          <Text style={styles.headline}>
            {isWelcome
              ? "Create cosmic wallpapers from a single idea."
              : "Credits power each wallpaper generation."}
          </Text>
          <Text style={styles.body}>
            {isWelcome
              ? "Cozmic Wallpapers turns your prompts into original planets, galaxies, and deep-space scenes tuned for your phone."
              : "Pick how many images to make, choose a resolution, and spend credits only when the render starts. Finished wallpaper downloads do not cost extra."}
          </Text>
        </View>

        {isWelcome ? (
          <View style={styles.featureRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featureValue}>AI</Text>
              <Text style={styles.featureLabel}>prompt lab</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featureValue}>4K</Text>
              <Text style={styles.featureLabel}>ready</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featureValue}>5</Text>
              <Text style={styles.featureLabel}>per batch</Text>
            </View>
          </View>
        ) : (
          <View style={styles.creditGrid}>
            {creditCosts.map((cost) => (
              <View key={cost.label} style={styles.creditTile}>
                <Text style={styles.creditLabel}>{cost.label}</Text>
                <Text style={styles.creditValue}>{cost.value}</Text>
                <Text style={styles.creditCaption}>per image</Text>
              </View>
            ))}
          </View>
        )}

        <AppButton
          bgColor={colors.cyan}
          customStyle={styles.continueButton}
          onPress={onContinue}
          textColor={colors.ink}
          textStyle={styles.continueLabel}
          title={isWelcome ? "Continue" : "Start creating"}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    minHeight: 620,
    justifyContent: "center",
    gap: 24,
    paddingVertical: 12,
  },
  visualPanel: {
    height: 250,
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
  },
  orbitLarge: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: "rgba(114, 228, 255, 0.16)",
    top: -80,
    right: -84,
    transform: [{ scaleX: 1.35 }, { rotate: "-18deg" }],
  },
  orbitSmall: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255, 209, 102, 0.18)",
    bottom: -42,
    left: -24,
    transform: [{ scaleX: 1.28 }, { rotate: "26deg" }],
  },
  planet: {
    position: "absolute",
    left: 44,
    bottom: 38,
    width: 104,
    height: 104,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 52,
    backgroundColor: "#123A63",
    borderWidth: 1,
    borderColor: "rgba(216, 228, 242, 0.18)",
    zIndex: 2,
  },
  planetShadow: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(2, 8, 22, 0.22)",
    left: -24,
    bottom: -18,
  },
  planetGlow: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(114, 228, 255, 0.28)",
    top: 8,
    right: 8,
  },
  planetBand: {
    position: "absolute",
    width: 118,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 52,
    transform: [{ rotate: "-18deg" }],
  },
  planetRingBack: {
    position: "absolute",
    left: 18,
    bottom: 70,
    width: 166,
    height: 46,
    borderRadius: 23,
    borderWidth: 4,
    borderColor: "rgba(255, 209, 102, 0.44)",
    transform: [{ rotate: "-18deg" }],
    zIndex: 1,
  },
  planetRingFrontClip: {
    position: "absolute",
    left: 18,
    bottom: 40,
    width: 166,
    height: 58,
    overflow: "hidden",
    zIndex: 3,
  },
  planetRingFront: {
    position: "absolute",
    left: 0,
    bottom: 30,
    width: 166,
    height: 46,
    borderRadius: 23,
    borderWidth: 4,
    borderColor: "rgba(255, 209, 102, 0.82)",
    transform: [{ rotate: "-18deg" }],
  },
  starOne: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    right: 72,
    top: 54,
  },
  starTwo: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cyan,
    right: 134,
    top: 116,
  },
  starThree: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
    left: 178,
    bottom: 58,
  },
  shootingStar: {
    position: "absolute",
    top: 76,
    left: 22,
    width: 130,
    height: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  starTrail: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(114, 228, 255, 0.62)",
  },
  starHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    shadowColor: colors.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  copyBlock: {
    gap: 12,
  },
  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  headline: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 38,
  },
  body: {
    color: colors.cloud,
    fontSize: typography.body,
    lineHeight: 23,
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
  },
  featurePill: {
    flex: 1,
    minHeight: 92,
    justifyContent: "space-between",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
    padding: 14,
  },
  featureValue: {
    color: colors.cyan,
    fontSize: 24,
    fontWeight: "900",
  },
  featureLabel: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  creditGrid: {
    flexDirection: "row",
    gap: 10,
  },
  creditTile: {
    flex: 1,
    minHeight: 108,
    justifyContent: "space-between",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
    padding: 14,
  },
  creditLabel: {
    color: colors.cyan,
    fontSize: 26,
    fontWeight: "900",
  },
  creditValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  creditCaption: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  continueButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    paddingVertical: 15,
    shadowColor: colors.cyan,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  continueLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "900",
  },
});
