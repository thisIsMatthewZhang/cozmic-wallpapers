import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "./AppButton";
import { colors, radii, typography } from "../constants/theme";

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  autoComplete?:
    | "name"
    | "email"
    | "password"
    | "username"
    | "off";
  textContentType?:
    | "name"
    | "emailAddress"
    | "password"
    | "username"
    | "none";
  showToggle?: boolean;
  isSecureVisible?: boolean;
  onToggleSecure?: () => void;
};

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = "none",
  keyboardType = "default",
  autoComplete,
  textContentType,
  showToggle = false,
  isSecureVisible = false,
  onToggleSecure,
}: Readonly<AuthTextFieldProps>) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mist}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          style={styles.input}
          textContentType={textContentType}
          value={value}
        />
        {showToggle ? (
          <AppButton
            bgColor="transparent"
            customStyle={styles.toggle}
            onPress={() => onToggleSecure?.()}
            textColor={colors.cyan}
            textStyle={styles.toggleLabel}
            title={isSecureVisible ? "Hide" : "Show"}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: colors.cloud,
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.overlay,
    paddingLeft: 16,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 56,
    color: colors.white,
    fontSize: typography.body,
  },
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleLabel: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "700",
  },
});
