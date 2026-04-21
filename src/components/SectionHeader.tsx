import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../constants/theme";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: Readonly<SectionHeaderProps>) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "800",
  },
  description: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
});
