import type { ComponentPropsWithoutRef } from "react";
import {
  ActivityIndicator,
  ColorValue,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface ButtonProps {
  title: string;
  bgColor: ColorValue;
  textColor: ColorValue;
  onPress: () => void;
  isLoading?: boolean;
  loadingColor?: ColorValue;
  customStyle?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  textStyle?: StyleProp<TextStyle>;
  pressableProps?: Omit<
    ComponentPropsWithoutRef<typeof Pressable>,
    "onPress" | "style"
  >;
}

export default function AppButton({
  title,
  bgColor,
  textColor,
  onPress,
  isLoading = false,
  loadingColor,
  customStyle,
  textStyle,
  pressableProps,
}: Readonly<ButtonProps>) {
  let clicked = false;

  return (
    <Pressable
      style={({ pressed }) => {
        return [
          {
            opacity: pressed ? 0.5 : 1,
            backgroundColor: bgColor,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
          },
          typeof customStyle === "function"
            ? customStyle({ pressed })
            : customStyle,
        ];
      }}
      onPress={() => {
        if (clicked) return;
        clicked = true;
        if (!isLoading) {
          onPress();
        }
        setTimeout(() => (clicked = false), 1000);
      }}
      {...pressableProps}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={loadingColor ?? textColor} />
        ) : (
          <Text
            style={[
              { color: textColor, fontWeight: "bold" },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = {
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
} as const;
