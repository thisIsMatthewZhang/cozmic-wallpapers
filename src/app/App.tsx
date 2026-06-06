import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useState } from "react";

import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { AuthenticatedHome } from "./AuthenticatedHome";
import { GeneratedWallpapersScreen } from "./GeneratedWallpapersScreen";
import { AuthScreen } from "./AuthScreen";

type AppRoute =
  | { name: "home" }
  | { images: string[]; name: "generatedWallpapers" };

export default function CozmicApp() {
  const { user, isBootstrapping } = useAuth();
  const [route, setRoute] = useState<AppRoute>({ name: "home" });

  if (isBootstrapping) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <ScreenShell>
          <View style={styles.loader}>
            <ActivityIndicator color={colors.cyan} size="large" />
          </View>
        </ScreenShell>
      </>
    );
  }

  if (route.name === "generatedWallpapers") {
    return (
      <GeneratedWallpapersScreen
        jobImagePaths={route.images}
        onBack={() => setRoute({ name: "home" })}
      />
    );
  }

  return user ? (
      <AuthenticatedHome
        onGenerationComplete={(images) =>
          setRoute({ images, name: "generatedWallpapers" })
        }
    />
  ) : <AuthScreen />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    minHeight: 480,
    alignItems: "center",
    justifyContent: "center",
  },
});
