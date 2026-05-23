import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageSourcePropType,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "@/src/components/AppButton";
import AppCarousel from "@/src/components/AppCarousel";
import ReusableModal from "@/src/components/ReusableModal";
import { ScreenShell } from "@/src/components/ScreenShell";
import { colors, radii, typography } from "@/src/constants/theme";
import { createNewDirectory, downloadFileToDirectory, createAssetsFromDirectory, createNewAlbum, addAssetsToAlbum } from "../utils/mediaDownload";

type GeneratedWallpapersScreenProps = {
  images: ImageSourcePropType[];
  onBack: () => void;
};

const isNetworkUri = (uri: string) => /^https?:\/\//i.test(uri);

const getNetworkImageUri = (source: ImageSourcePropType): string | null => {
  if (typeof source === "number") return null;

  const imageSource = Array.isArray(source) ? source[0] : source;
  return imageSource.uri && isNetworkUri(imageSource.uri)
    ? imageSource.uri
    : null;
};

export function GeneratedWallpapersScreen({
  images,
  onBack,
}: Readonly<GeneratedWallpapersScreenProps>) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumName, setAlbumName] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScreenShell>
        <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
          <View style={styles.topBar}>
            <View style={styles.titleGroup}>
              <Text style={styles.kicker}>Images Ready</Text>
              <Text style={styles.title}>Your wallpaper options</Text>
            </View>
            <AppButton
              bgColor={colors.panelSoft}
              customStyle={styles.backButton}
              onPress={onBack}
              textColor={colors.cloud}
              textStyle={styles.backButtonLabel}
              title="Back"
            />
          </View>

          {images.length ? (
            <View style={styles.previewPanel}>
              <AppCarousel data={images} />
            </View>
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyTitle}>No previews returned</Text>
              <Text style={styles.emptyCopy}>
                The render finished, but the job did not include image paths.
              </Text>
            </View>
          )}

          <View style={styles.summaryPanel}>
            <Text style={styles.summaryValue}>{images.length}</Text>
            <Text style={styles.summaryLabel}>
              {images.length === 1
                ? "wallpaper generated"
                : "wallpapers generated"}
            </Text>
          </View>

          <AppButton
            bgColor={colors.cyan}
            customStyle={styles.saveButton}
            onPress={() => setShowAlbumModal(true)}
            textColor={colors.void}
            textStyle={styles.saveButtonLabel}
            title="Save to New Album"
          />
        </Animated.View>
      </ScreenShell>
      <ReusableModal
        showModal={showAlbumModal}
        setShowModal={setShowAlbumModal}
        modalProps={{ animationType: "fade", transparent: true }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>New album</Text>
            <TextInput
              autoFocus
              placeholder="Album name"
              placeholderTextColor={colors.mist}
              value={albumName}
              onChangeText={setAlbumName}
              style={styles.albumInput}
            />
            <View style={styles.modalActions}>
              <AppButton
                bgColor={colors.panelSoft}
                customStyle={styles.modalButton}
                onPress={() => {
                  setAlbumName("");
                  setShowAlbumModal(false);

                }}
                textColor={colors.cloud}
                title="Cancel"
              />
              <AppButton
                bgColor={colors.cyan}
                customStyle={styles.modalButton}
                onPress={async () => {
                  const urls = images.map(getNetworkImageUri).filter((url): url is string => url !== null);
                  if (!albumName.trim() || !urls.length) return;
                  const directory = createNewDirectory(albumName);
                  await Promise.all(urls.map(url => downloadFileToDirectory(url, directory)));
                  const assets = await createAssetsFromDirectory(directory);
                  if (!assets.length) return;
                  const newAlbum = await createNewAlbum(albumName.trim(), assets[0]);
                  await addAssetsToAlbum(newAlbum, assets.slice(1));
                  setShowAlbumModal(false);
                }}
                textColor={colors.void}
                title="Confirm"
              />
            </View>
          </View>
        </View>
      </ReusableModal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  titleGroup: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: typography.headline,
    fontWeight: "900",
    lineHeight: 30,
  },
  backButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.panelSoft,
  },
  backButtonLabel: {
    color: colors.cloud,
    fontSize: 13,
    fontWeight: "700",
  },
  previewPanel: {
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.ink,
    paddingVertical: 18,
  },
  emptyPanel: {
    gap: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
    padding: 18,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "800",
  },
  emptyCopy: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
  summaryPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(8, 20, 39, 0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryValue: {
    color: colors.cyan,
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: colors.cloud,
    fontSize: typography.body,
    fontWeight: "700",
  },
  saveButton: {
    borderRadius: radii.md,
    paddingVertical: 14,
  },
  saveButtonLabel: {
    fontSize: typography.body,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.overlay,
    paddingHorizontal: 20,
    paddingTop: 144,
  },
  modalPanel: {
    width: "100%",
    gap: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.midnight,
    padding: 18,
  },
  modalTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900",
  },
  albumInput: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.night,
    color: colors.white,
    fontSize: typography.body,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
  },
});
