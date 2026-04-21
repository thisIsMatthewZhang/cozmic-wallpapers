import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";

import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { AuthenticatedHome } from "./AuthenticatedHome";
import { AuthScreen } from "./AuthScreen";

export default function CozmicApp() {
  const { user, isBootstrapping } = useAuth();

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

  return user ? <AuthenticatedHome /> : <AuthScreen />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    minHeight: 480,
    alignItems: "center",
    justifyContent: "center",
  },
});
