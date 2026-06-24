import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radii, typography } from "../constants/theme";
import type { WallpaperPreview } from "../types/wallpaper";
import ReusableModal from "./ReusableModal";

type GenerationHistoryGridModalProps = {
  images: WallpaperPreview[];
  onImagePress: (image: WallpaperPreview) => void;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

export function GenerationHistoryGridModal({
  images,
  onImagePress,
  showModal,
  setShowModal,
}: Readonly<GenerationHistoryGridModalProps>) {
  const gridImages = images.filter(
    (image): image is WallpaperPreview & { imageUri: string } =>
      typeof image.imageUri === "string" && image.imageUri.length > 0,
  );

  return (
    <ReusableModal
      showModal={showModal}
      setShowModal={setShowModal}
      modalProps={{
        transparent: true,
        presentationStyle: "overFullScreen",
      }}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Close generation history"
          accessibilityRole="button"
          onPress={() => setShowModal(false)}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>History</Text>
              <Text style={styles.title}>Generated wallpapers</Text>
            </View>
            <Pressable
              accessibilityLabel="Close generation history"
              accessibilityRole="button"
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeLabel}>X</Text>
            </Pressable>
          </View>

          {gridImages.length ? (
            <ScrollView
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            >
              {gridImages.map((image) => (
                <Pressable
                  accessibilityRole="imagebutton"
                  key={image.id}
                  onPress={() => onImagePress(image)}
                  style={styles.gridItem}
                >
                  <ImageBackground
                    imageStyle={styles.gridImage}
                    source={{ uri: image.imageUri }}
                    style={styles.gridImageFrame}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>
              Generated wallpapers will appear here after the images finish
              loading.
            </Text>
          )}
        </View>
      </View>
    </ReusableModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 8, 22, 0.68)",
  },
  sheet: {
    maxHeight: "88%",
    overflow: "hidden",
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.lineStrong,
    backgroundColor: colors.ink,
    padding: 18,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: typography.headline,
    fontWeight: "800",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelSoft,
  },
  closeLabel: {
    color: colors.cloud,
    fontSize: typography.body,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 10,
  },
  gridItem: {
    width: "48%",
    aspectRatio: 9 / 16,
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelBright,
  },
  gridImage: {
    borderRadius: radii.md,
  },
  gridImageFrame: {
    flex: 1,
  },
  emptyText: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
});
