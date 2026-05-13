import { StyleSheet } from "react-native";

import AppButton from "./AppButton";
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
}: Readonly<ChoiceChipProps>) {
  return (
    <AppButton
      bgColor={selected ? accent : "rgba(255, 255, 255, 0.05)"}
      customStyle={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: accent, borderColor: accent },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress?.()}
      textColor={selected ? colors.ink : colors.cloud}
      textStyle={[styles.label, selected && styles.labelSelected]}
      title={label}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    opacity: 0.88,
  },
});
