import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import CozmicApp from "./src/app/App";
import { AppUserProvider } from "./src/contexts/AppUserContext";
import { colors } from "./src/constants/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <AppUserProvider>
          <CozmicApp />
        </AppUserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
  },
});
