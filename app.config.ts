import type { ExpoConfig } from "expo/config";

// {
//   "expo": {
//     "plugins": [
//       [
//         "expo-iap",
//         {
//           "iapkitApiKey": "openiap-kit_<your-key>",
//           "modules": {
//             "onside": true,
//             "horizon": true
//           },
//           "google": {
//             "horizonAppId": "YOUR_HORIZON_APP_ID"
//           }
//         }
//       ]
//     ]
//   }
// }

const config: ExpoConfig = {
  name: "Cozmic Wallpapers",
  slug: "cozmic-wallpapers",
  orientation: "portrait",
  plugins: ["expo-iap"],
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
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    package: "app.wallpapers.cozmic",
  },
  extra: {
    eas: {
      projectId: "efe5efb3-e3f7-4dd1-973b-196d2c1ae4f5",
    },
  },
};

export default config;
