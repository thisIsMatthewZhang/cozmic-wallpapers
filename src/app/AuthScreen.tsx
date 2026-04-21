import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthTextField } from "../components/AuthTextField";
import { ChoiceChip } from "../components/ChoiceChip";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, typography } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "sign-in" | "sign-up";

export function AuthScreen() {
  const { signIn, signUp, isSubmitting, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const activeError = localError ?? authError;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLocalError(null);
    clearAuthError();
  };

  const handleSubmit = async () => {
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    if (mode === "sign-up") {
      if (!displayName.trim()) {
        setLocalError("Add a display name so your gallery feels personal.");
        return;
      }

      if (password.length < 6) {
        setLocalError("Use a password with at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
    }

    try {
      if (mode === "sign-in") {
        await signIn(email, password);
      } else {
        await signUp({ email, password, displayName });
      }
    } catch {
      // Errors are surfaced through auth context state.
    }
  };

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Launch Pad</Text>
        <Text style={styles.headline}>Sign in to generate and save cosmic wallpapers.</Text>
        <Text style={styles.subheadline}>
          Create an account to keep your prompt history, queued renders, and
          favorite space scenes in one place.
        </Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.modeRow}>
          <ChoiceChip
            label="Create account"
            onPress={() => switchMode("sign-up")}
            selected={mode === "sign-up"}
          />
          <ChoiceChip
            label="Sign in"
            onPress={() => switchMode("sign-in")}
            selected={mode === "sign-in"}
          />
        </View>

        {mode === "sign-up" ? (
          <AuthTextField
            autoCapitalize="words"
            autoComplete="name"
            label="Display name"
            onChangeText={setDisplayName}
            placeholder="Nova Zhang"
            textContentType="name"
            value={displayName}
          />
        ) : null}

        <AuthTextField
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          textContentType="emailAddress"
          value={email}
        />

        <AuthTextField
          autoComplete="password"
          isSecureVisible={isPasswordVisible}
          label="Password"
          onChangeText={setPassword}
          onToggleSecure={() => setIsPasswordVisible((current) => !current)}
          placeholder="At least 6 characters"
          secureTextEntry
          showToggle
          textContentType="password"
          value={password}
        />

        {mode === "sign-up" ? (
          <AuthTextField
            autoComplete="password"
            isSecureVisible={isConfirmPasswordVisible}
            label="Confirm password"
            onChangeText={setConfirmPassword}
            onToggleSecure={() =>
              setIsConfirmPasswordVisible((current) => !current)
            }
            placeholder="Re-enter your password"
            secureTextEntry
            showToggle
            textContentType="password"
            value={confirmPassword}
          />
        ) : null}

        {activeError ? <Text style={styles.errorText}>{activeError}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
            pressed && !isSubmitting && styles.submitButtonPressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={styles.submitLabel}>
              {mode === "sign-up" ? "Create account" : "Sign in"}
            </Text>
          )}
        </Pressable>

        <Text style={styles.footnote}>
          Email/password auth is wired through Firebase and stored locally so
          sessions survive app restarts.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 20,
    gap: 10,
  },
  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  headline: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 38,
    textShadowColor: "rgba(2, 8, 22, 0.75)",
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 18,
  },
  subheadline: {
    color: colors.cloud,
    fontSize: typography.body,
    lineHeight: 23,
    maxWidth: "94%",
  },
  panel: {
    gap: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
    padding: 18,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  errorText: {
    color: colors.coral,
    fontSize: typography.body,
    lineHeight: 21,
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800",
  },
  footnote: {
    color: colors.mist,
    fontSize: 13,
    lineHeight: 19,
  },
});
