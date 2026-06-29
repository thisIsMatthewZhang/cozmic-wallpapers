import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Cozmic Wallpapers",
  slug: "cozmic-wallpapers",
  orientation: "portrait",
  plugins: ["expo-iap"],
  ios: {
    icon: "./assets/images/app-logo.png",
    supportsTablet: true,
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    bundleIdentifier: "app.wallpapers.cozmic",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#020817",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    icon: "./assets/images/app-logo.png",
    predictiveBackGestureEnabled: false,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    package: "app.wallpapers.cozmic",
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: "https://u.expo.dev/efe5efb3-e3f7-4dd1-973b-196d2c1ae4f5"
  },
  extra: {
    eas: {
      projectId: "efe5efb3-e3f7-4dd1-973b-196d2c1ae4f5",
    },
  },
};

export default config;
