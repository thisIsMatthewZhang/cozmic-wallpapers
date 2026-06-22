import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";

import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../constants/theme";
import { useAppUser } from "../contexts/AppUserContext";
import { AuthenticatedHome } from "./AuthenticatedHome";
import { GeneratedWallpapersScreen } from "./GeneratedWallpapersScreen";

type AppRoute =
  | { name: "home" }
  | { images: string[]; name: "generatedWallpapers" };

export default function CozmicApp() {
  const { errorMessage, isBootstrapping } = useAppUser();
  const [route, setRoute] = useState<AppRoute>({ name: "home" });

  if (isBootstrapping || errorMessage) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <ScreenShell>
          <View style={styles.loader}>
            {isBootstrapping ? (
              <ActivityIndicator color={colors.cyan} size="large" />
            ) : (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
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

  return (
    <AuthenticatedHome
      onGenerationComplete={(images) =>
        setRoute({ images, name: "generatedWallpapers" })
      }
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    minHeight: 480,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.coral,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    textAlign: "center",
  },
});
