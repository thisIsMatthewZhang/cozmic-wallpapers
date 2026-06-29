import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../constants/theme";
import { useAppUser } from "../contexts/AppUserContext";
import { AuthenticatedHome } from "./AuthenticatedHome";
import { GeneratedWallpapersScreen } from "./GeneratedWallpapersScreen";
import { OnboardingScreen } from "./OnboardingScreen";

type AppRoute =
  | { name: "welcome" }
  | { name: "credits" }
  | { name: "home" }
  | { images: string[]; name: "generatedWallpapers" };

const onboardingStorage = createAsyncStorage("cozmic-wallpapers-onboarding");
const ONBOARDING_COMPLETE_VALUE = "true";

function getOnboardingCompleteKey(uid: string) {
  return `onboarding-complete:${uid}`;
}

export default function CozmicApp() {
  const { bootstrapMessage, errorMessage, isBootstrapping, uid } = useAppUser();
  const [route, setRoute] = useState<AppRoute | null>(null);

  useEffect(() => {
    let isActive = true;

    if (isBootstrapping || errorMessage) {
      return undefined;
    }

    if (!uid) {
      setRoute({ name: "welcome" });
      return undefined;
    }

    void onboardingStorage
      .getItem(getOnboardingCompleteKey(uid))
      .then((value) => {
        if (!isActive) return;

        setRoute(
          value === ONBOARDING_COMPLETE_VALUE
            ? { name: "home" }
            : { name: "welcome" },
        );
      })
      .catch(() => {
        if (!isActive) return;
        setRoute({ name: "welcome" });
      });

    return () => {
      isActive = false;
    };
  }, [errorMessage, isBootstrapping, uid]);

  const completeOnboarding = () => {
    if (!uid) {
      setRoute({ name: "home" });
      return;
    }

    void onboardingStorage
      .setItem(getOnboardingCompleteKey(uid), ONBOARDING_COMPLETE_VALUE)
      .finally(() => setRoute({ name: "home" }));
  };

  if (isBootstrapping || errorMessage || route === null) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <ScreenShell>
          <View style={styles.loader}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
              <>
                <ActivityIndicator color={colors.cyan} size="large" />
                <Text style={styles.loaderText}>{bootstrapMessage}</Text>
              </>
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

  if (route.name === "welcome") {
    return (
      <OnboardingScreen
        onContinue={() => setRoute({ name: "credits" })}
        step="welcome"
      />
    );
  }

  if (route.name === "credits") {
    return (
      <OnboardingScreen
        onContinue={completeOnboarding}
        step="credits"
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
  loaderText: {
    color: colors.mist,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
});
