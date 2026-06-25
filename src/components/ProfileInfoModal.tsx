import { useMemo } from "react";
import {
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, typography } from "../constants/theme";
import ReusableModal from "./ReusableModal";

type ProfileInfoModalProps = {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  uid: string | null;
};

const PRIVACY_POLICY_URL = "https://cozmic-wallpapers-65b41.web.app/privacy";
const SUPPORT_URL = "https://cozmic-wallpapers-65b41.web.app/support";

export function ProfileInfoModal({
  showModal,
  setShowModal,
  uid,
}: Readonly<ProfileInfoModalProps>) {
  const insets = useSafeAreaInsets();
  const headerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 16 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 70) {
            setShowModal(false);
          }
        },
      }),
    [setShowModal],
  );

  return (
    <ReusableModal
      showModal={showModal}
      setShowModal={setShowModal}
      modalProps={{
        presentationStyle: "fullScreen",
      }}
    >
      <View style={[styles.screen, { paddingTop: insets.top + 18 }]}>
        <View style={styles.header} {...headerPanResponder.panHandlers}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Profile</Text>
            <Text style={styles.title}>App information</Text>
          </View>
          <Pressable
            accessibilityLabel="Close profile information"
            accessibilityRole="button"
            onPress={() => setShowModal(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeLabel}>X</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App user ID</Text>
            <Text selectable style={styles.uidValue}>
              {uid ?? "App user ID unavailable"}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
            <Text style={styles.body}>
              Cozmic Wallpapers is committed to maintaining your privacy and
              processing your information in accordance with the EU GDPR. The
              Privacy Policy applies to all websites and mobile applications
              owned or controlled by Cozmic Wallpapers at any given time,
              including the applications listed on the Cozmic Wallpapers
              developer pages in the Apple App Store and Google Play Store.
            </Text>
            <Text style={styles.body}>
              Please read the full Privacy Policy carefully to understand how
              data is collected, processed, managed, and used, and to learn
              about your rights as a data subject.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void Linking.openURL(PRIVACY_POLICY_URL);
              }}
              style={styles.linkButton}
            >
              <Text style={styles.linkButtonText}>
                View Full Privacy Policy
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms of Service</Text>
            <Text style={styles.body}>
              Terms of Service will be available here before launch.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => undefined}
              style={styles.linkButton}
            >
              <Text style={styles.linkButtonText}>
                View Terms of Service
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <Text style={styles.body}>
              For support, include your app user ID and a short description of
              the issue so your request can be matched to your generated jobs.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void Linking.openURL(SUPPORT_URL);
              }}
              style={styles.linkButton}
            >
              <Text style={styles.linkButtonText}>Contact Support</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ReusableModal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingBottom: 18,
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
    fontWeight: "900",
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelSoft,
  },
  closeLabel: {
    color: colors.cloud,
    fontSize: typography.body,
    fontWeight: "900",
  },
  content: {
    gap: 14,
    paddingBottom: 28,
  },
  section: {
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
    padding: 16,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "800",
  },
  uidValue: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  body: {
    color: colors.cloud,
    fontSize: typography.body,
    lineHeight: 22,
  },
  linkButton: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.cyan,
    backgroundColor: "rgba(114, 228, 255, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  linkButtonText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "800",
  },
});
