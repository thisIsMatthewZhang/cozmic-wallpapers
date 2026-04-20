import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Cozmic Wallpapers",
  slug: "cozmic-wallpapers",
  orientation: "portrait",
  ios: {
    supportsTablet: true,
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    bundleIdentifier: "app.wallpapers.cozmic",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    googleServicesFile: "./google-services.json",
    package: "app.wallpapers.cozmic",
  },
  extra: {
    eas: {
      projectId: "efe5efb3-e3f7-4dd1-973b-196d2c1ae4f5",
    },
  },
};

export default config;
