import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radii, typography } from "../constants/theme";
import type { WallpaperPreview } from "../types/wallpaper";
import {
  askUserForPermission,
  createNewDirectory,
  downloadFileToDirectory,
  saveWallpapersToLibrary,
} from "../utils/mediaDownload";
import ReusableModal from "./ReusableModal";
import SuccessfulSaveAnimation from "./SuccessfulSaveAnimation";

type WallpaperRedownloadModalProps = {
  image: WallpaperPreview | null;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

function DownloadIcon() {
  return (
    <View style={styles.downloadIcon}>
      <View style={styles.downloadArrowStem} />
      <View style={styles.downloadArrowHead} />
      <View style={styles.downloadTray} />
    </View>
  );
}

export function WallpaperRedownloadModal({
  image,
  showModal,
  setShowModal,
}: Readonly<WallpaperRedownloadModalProps>) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageUri = image?.imageUri;

  useEffect(() => {
    if (!showModal) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setDownloadError(null);
    setDownloadComplete(false);
  }, [imageUri, showModal]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleDownload = async () => {
    if (!imageUri || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadComplete(false);

    try {
      await askUserForPermission();
      const directory = await createNewDirectory(
        `cozmic-wallpapers-redownload-${Date.now()}`,
      );
      const downloadedUri = await downloadFileToDirectory(imageUri, directory);
      if (!downloadedUri) {
        throw new Error("Failed to download wallpaper.");
      }
      await saveWallpapersToLibrary(directory);
      directory.delete();
      setDownloadComplete(true);
      closeTimeoutRef.current = setTimeout(() => {
        setShowModal(false);
      }, 4500);
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "Failed to save wallpaper to Photos.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

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
          accessibilityLabel="Close wallpaper download"
          accessibilityRole="button"
          onPress={() => setShowModal(false)}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Download</Text>
              <Text style={styles.title}>Generated wallpaper</Text>
            </View>
            <Pressable
              accessibilityLabel="Close wallpaper download"
              accessibilityRole="button"
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeLabel}>X</Text>
            </Pressable>
          </View>

          {imageUri ? (
            <View style={styles.imageFrame}>
              <Image
                resizeMode="contain"
                source={{ uri: imageUri }}
                style={styles.image}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>
              This wallpaper is still loading. Try again in a moment.
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={!imageUri || isDownloading}
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.downloadButton,
              pressed && styles.downloadButtonPressed,
              (!imageUri || isDownloading) && styles.downloadButtonDisabled,
            ]}
          >
            <DownloadIcon />
            <Text style={styles.downloadLabel}>
              {isDownloading ? "Downloading" : "Download"}
            </Text>
          </Pressable>

          {downloadComplete ? (
            <SuccessfulSaveAnimation message="Wallpaper successfully saved to Photos." />
          ) : null}
          {downloadError ? (
            <Text style={styles.errorText}>{downloadError}</Text>
          ) : null}
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
    maxHeight: "92%",
    overflow: "hidden",
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.lineStrong,
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 34,
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
  imageFrame: {
    width: "100%",
    aspectRatio: 3 / 4,
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.void,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  downloadButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: radii.md,
    backgroundColor: colors.cyan,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  downloadButtonPressed: {
    opacity: 0.72,
  },
  downloadButtonDisabled: {
    opacity: 0.55,
  },
  downloadLabel: {
    color: colors.void,
    fontSize: typography.body,
    fontWeight: "900",
  },
  downloadIcon: {
    width: 18,
    height: 18,
    alignItems: "center",
  },
  downloadArrowStem: {
    width: 3,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.void,
  },
  downloadArrowHead: {
    width: 9,
    height: 9,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.void,
    transform: [{ rotate: "45deg" }],
    marginTop: -8,
  },
  downloadTray: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.void,
    marginTop: 5,
  },
  emptyText: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
  errorText: {
    color: colors.coral,
    fontSize: typography.body,
    lineHeight: 21,
  },
});
