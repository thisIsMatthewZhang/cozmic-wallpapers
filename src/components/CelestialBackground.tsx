import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "../constants/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const stars = [
  { top: screenHeight * 0.07, left: screenWidth * 0.14, size: 2, opacity: 0.85 },
  { top: screenHeight * 0.11, left: screenWidth * 0.72, size: 3, opacity: 0.55 },
  { top: screenHeight * 0.18, left: screenWidth * 0.48, size: 2, opacity: 0.65 },
  { top: screenHeight * 0.22, left: screenWidth * 0.86, size: 2, opacity: 0.4 },
  { top: screenHeight * 0.29, left: screenWidth * 0.09, size: 3, opacity: 0.42 },
  { top: screenHeight * 0.34, left: screenWidth * 0.62, size: 2, opacity: 0.6 },
  { top: screenHeight * 0.42, left: screenWidth * 0.28, size: 2, opacity: 0.7 },
  { top: screenHeight * 0.51, left: screenWidth * 0.82, size: 3, opacity: 0.48 },
  { top: screenHeight * 0.58, left: screenWidth * 0.16, size: 2, opacity: 0.5 },
  { top: screenHeight * 0.66, left: screenWidth * 0.56, size: 2, opacity: 0.35 },
  { top: screenHeight * 0.76, left: screenWidth * 0.73, size: 3, opacity: 0.4 },
  { top: screenHeight * 0.82, left: screenWidth * 0.23, size: 2, opacity: 0.6 },
];

const shootingStars = [
  {
    top: 72,
    left: -140,
    delay: 700,
    duration: 5200,
    travelX: screenWidth + 260,
    travelY: 210,
    scale: 0.95,
  },
  {
    top: 214,
    left: -110,
    delay: 2500,
    duration: 6000,
    travelX: screenWidth + 220,
    travelY: 170,
    scale: 0.72,
  },
  {
    top: screenHeight * 0.58,
    left: -120,
    delay: 3900,
    duration: 6800,
    travelX: screenWidth + 200,
    travelY: 160,
    scale: 0.6,
  },
];

export function CelestialBackground() {
  const animations = useRef(shootingStars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = animations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(shootingStars[index].delay),
          Animated.timing(animation, {
            toValue: 1,
            duration: shootingStars[index].duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(2600),
          Animated.timing(animation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [animations]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.baseGradient} />
      <View style={styles.glowTop} />
      <View style={styles.glowCenter} />
      <View style={styles.glowBottom} />
      <View style={styles.orbitLarge} />
      <View style={styles.orbitSmall} />

      {stars.map((star, index) => (
        <View
          key={`star-${index}`}
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {shootingStars.map((shootingStar, index) => {
        const animation = animations[index];

        return (
          <Animated.View
            key={`shooting-star-${index}`}
            style={[
              styles.shootingStar,
              {
                top: shootingStar.top,
                left: shootingStar.left,
                opacity: animation.interpolate({
                  inputRange: [0, 0.1, 0.22, 0.33, 1],
                  outputRange: [0, 0, 0.85, 0.35, 0],
                }),
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, shootingStar.travelX],
                    }),
                  },
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, shootingStar.travelY],
                    }),
                  },
                  { rotate: "17deg" },
                  { scale: shootingStar.scale },
                ],
              },
            ]}
          >
            <View style={styles.shootingTail} />
            <View style={styles.shootingHead} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.void,
  },
  baseGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.void,
  },
  glowTop: {
    position: "absolute",
    top: -120,
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(114, 228, 255, 0.14)",
  },
  glowCenter: {
    position: "absolute",
    top: 180,
    left: -20,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(133, 151, 255, 0.12)",
  },
  glowBottom: {
    position: "absolute",
    bottom: 80,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 209, 102, 0.08)",
  },
  orbitLarge: {
    position: "absolute",
    top: 150,
    left: 16,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(216, 228, 242, 0.06)",
    transform: [{ scaleX: 1.4 }, { rotate: "-18deg" }],
  },
  orbitSmall: {
    position: "absolute",
    bottom: 140,
    right: 24,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(216, 228, 242, 0.05)",
    transform: [{ scaleX: 1.2 }, { rotate: "28deg" }],
  },
  star: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  shootingStar: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  shootingTail: {
    width: 96,
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(248, 251, 255, 0.18)",
  },
  shootingHead: {
    width: 6,
    height: 6,
    marginLeft: -4,
    borderRadius: 999,
    backgroundColor: colors.white,
    shadowColor: colors.white,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
