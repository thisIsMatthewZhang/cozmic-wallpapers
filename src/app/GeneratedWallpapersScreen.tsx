import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageSourcePropType,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/src/components/AppButton";
import AppCarousel from "@/src/components/AppCarousel";
import SuccessfulSaveAnimation from "../components/SuccessfulSaveAnimation";
import { ScreenShell } from "@/src/components/ScreenShell";
import { colors, radii, typography } from "@/src/constants/theme";
import { storage } from "@/src/utils/firebase";
import { createNewDirectory, downloadFileToDirectory, saveWallpapersToLibrary, askUserForPermission } from "../utils/mediaDownload";
import { getDownloadURL, ref } from "firebase/storage";

type GeneratedWallpapersScreenProps = {
  jobImagePaths: string[];
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
  jobImagePaths,
  onBack,
}: Readonly<GeneratedWallpapersScreenProps>) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [images, setImages] = useState<ImageSourcePropType[]>([]); // URIs to pass to AppCarousel
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showSavingSpinner, setShowSavingSpinner] = useState<boolean>(false);
  const [failedToDisplayImages, setFailedToDisplayImages] = useState<boolean>(false);
  const [displaySuccessAnim, setDisplaySuccessAnim] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  useEffect(() => {
    Promise.all(jobImagePaths.map(async (path) => {
      const url = await getDownloadURL(ref(storage, path));
      return url;
    }))
    .then((urls) => {
      if (!isMountedRef.current) return;
      setImageUrls(urls);
      setImages(urls.map((url) => ({ uri: url })));
    })
    .catch((reason) => {
      if (!isMountedRef.current) return;
      setFailedToDisplayImages(true);
      setImageUrls([]);
      setImages([]);
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [jobImagePaths]);

  const handleSaveToPhotos = async () => {
    if (!imageUrls.length || showSavingSpinner) return;

    setShowSavingSpinner(true);
    setSaveError("");

    try {
      await askUserForPermission();
      const directory = await createNewDirectory("cozmic-wallpapers");
      await Promise.all(imageUrls.map(url => downloadFileToDirectory(url, directory)));
      await saveWallpapersToLibrary(directory);
      directory.delete();
      setDisplaySuccessAnim(true);
      setTimeout(onBack, 4500);
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        setSaveError(
          error instanceof Error ? error.message : "Failed to save wallpapers to Photos.",
        );
      }
    } finally {
      if (isMountedRef.current) {
        setShowSavingSpinner(false);
      }
    }
  };

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

          {failedToDisplayImages ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyTitle}>Failed to display images.</Text>
            </View>
          ) : images.length ? (
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

          {displaySuccessAnim ? <SuccessfulSaveAnimation /> : null}

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
            isLoading={showSavingSpinner}
            loadingColor={colors.void}
            onPress={handleSaveToPhotos}
            textColor={colors.void}
            textStyle={styles.saveButtonLabel}
            title="Save to Photos"
            pressableProps={{ disabled: showSavingSpinner || !imageUrls.length }}
          />
          {saveError ? (
            <Text style={styles.errorText}>{saveError}</Text>
          ) : null}
        </Animated.View>
      </ScreenShell>
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
  errorText: {
    color: colors.coral,
    fontSize: typography.body,
    lineHeight: 21,
  },
});
