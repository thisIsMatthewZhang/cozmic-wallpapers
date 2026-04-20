import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii } from "../constants/theme";

type ChoiceChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accent?: string;
};

export function ChoiceChip({
  label,
  selected = false,
  onPress,
  accent = colors.cyan,
}: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: accent, borderColor: accent },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    color: colors.cloud,
    fontSize: 14,
    fontWeight: "600",
  },
  labelSelected: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
});
