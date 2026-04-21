import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { CelestialBackground } from "./CelestialBackground";

export function ScreenShell({ children }: Readonly<PropsWithChildren>) {
  return (
    <View style={styles.container}>
      <CelestialBackground />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 20,
  },
});
