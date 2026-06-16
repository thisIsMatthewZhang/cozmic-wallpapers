import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";

import AppButton from "../components/AppButton";
import { SectionHeader } from "../components/SectionHeader";
import Store, { type StoreRenderProps } from "../components/Store";
import { creditPlans } from "../constants/creditPlans";
import { colors, radii, typography } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import type { CreditPlan } from "../types/wallpaper";
import { db } from "../utils/firebase";

type DownloadPlansScreenProps = {
  onClose: () => void;
};

const resolutionCosts = [
  { label: "1K", credits: 6 },
  { label: "2K", credits: 8 },
  { label: "4K", credits: 12 },
];

type PlanCardProps = {
  plan: CreditPlan;
  store: StoreRenderProps;
};

function PlanCard({ plan, store }: Readonly<PlanCardProps>) {
  const isAvailable = store.productAvailable(plan.id);
  const price = store.localizedPrices[plan.id] ?? (store.productsLoaded ? "Unavailable" : "Loading...");
  const isPurchasing = store.purchasingProductId === plan.id;

  return (
    <View style={[styles.planCard, { borderColor: plan.accent }]}>
      <View style={styles.planHeader}>
        <View style={styles.planTitleGroup}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>
        {plan.badge ? (
          <View style={[styles.badge, { backgroundColor: plan.accent }]}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.creditTotal}>{plan.credits} credits</Text>
      </View>

      <View style={styles.usageGrid}>
        {resolutionCosts.map((resolution) => (
          <View key={resolution.label} style={styles.usageTile}>
            <Text style={styles.usageValue}>
              {Math.floor(plan.credits / resolution.credits)}
            </Text>
            <Text style={styles.usageLabel}>{resolution.label} images</Text>
          </View>
        ))}
      </View>

      <View style={styles.featureList}>
        {plan.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: plan.accent }]} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <AppButton
        bgColor={colors.cyan}
        customStyle={({ pressed }) => [styles.planButton, pressed && styles.pressed]}
        isLoading={isPurchasing}
        onPress={() => void store.purchaseProduct(plan.id)}
        pressableProps={{ disabled: !store.connected || !isAvailable || store.purchasingProductId !== null }}
        textColor={colors.ink}
        textStyle={styles.planButtonText}
        title={isAvailable ? "Choose pack" : store.productsLoaded ? "Unavailable" : "Loading..."}
      />
    </View>
  );
}

export function DownloadPlansScreen({ onClose }: Readonly<DownloadPlansScreenProps>) {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      const balance = snapshot.data()?.creditBalance;
      setCreditBalance(typeof balance === "number" ? balance : 0);
    });
  }, [user]);

  return (
    <Store>
      {(store) => (
    <ScrollView
      contentContainerStyle={styles.modalContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <AppButton
          bgColor={colors.panelSoft}
          customStyle={styles.closeButton}
          onPress={onClose}
          textColor={colors.cloud}
          textStyle={styles.closeButtonText}
          title="Close"
        />
        <View style={styles.balancePill}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>
            {creditBalance === null ? "Loading..." : `${creditBalance} credits`}
          </Text>
        </View>
      </View>

      <View style={styles.heroPanel}>
        <View style={styles.heroOrbit} />
        <Text style={styles.kicker}>DOWNLOAD PLANS</Text>
        <Text style={styles.headline}>Buy credits, then spend them based on output resolution.</Text>
        <Text style={styles.subheadline}>
          Higher-resolution renders use more credits, while downloads stay free once the wallpaper is generated.
        </Text>
      </View>

      <View style={styles.explainerGrid}>
        {resolutionCosts.map((resolution) => (
          <View key={resolution.label} style={styles.explainerTile}>
            <Text style={styles.explainerValue}>{resolution.label}</Text>
            <Text style={styles.explainerLabel}>
              {resolution.credits} credits per generated image
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Credit Packages"
          title="Pick a pack for the way you create"
          description="New users also receive a Pod Bonus of 12 free credits during onboarding."
        />
        <View style={styles.planList}>
          {creditPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} store={store} />
          ))}
        </View>
      </View>

      {store.errorMessage ? (
        <Text style={styles.errorMessage}>{store.errorMessage}</Text>
      ) : null}
      {store.successMessage ? (
        <Text style={styles.successMessage}>{store.successMessage}</Text>
      ) : null}

      <View style={styles.notePanel}>
        <Text style={styles.noteTitle}>How the wallet could work</Text>
        <Text style={styles.noteText}>
          Credits stay in the account balance. Each generation charges by selected resolution, and finished wallpaper downloads do not cost additional credits.
        </Text>
      </View>
    </ScrollView>
      )}
    </Store>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  closeButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.panelSoft,
  },
  closeButtonText: {
    color: colors.cloud,
    fontSize: 13,
    fontWeight: "800",
  },
  balancePill: {
    alignItems: "flex-end",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "rgba(114, 228, 255, 0.09)",
  },
  balanceLabel: {
    color: colors.mist,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  balanceValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  heroPanel: {
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelBright,
    padding: 20,
    gap: 12,
  },
  heroOrbit: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255, 209, 102, 0.16)",
    top: -82,
    right: -54,
    transform: [{ scaleX: 1.36 }, { rotate: "-22deg" }],
  },
  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  headline: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  subheadline: {
    color: colors.cloud,
    fontSize: typography.body,
    lineHeight: 22,
  },
  explainerGrid: {
    flexDirection: "row",
    gap: 12,
  },
  explainerTile: {
    flex: 1,
    minHeight: 112,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
    padding: 16,
    justifyContent: "space-between",
  },
  explainerValue: {
    color: colors.cyan,
    fontSize: 30,
    fontWeight: "900",
  },
  explainerLabel: {
    color: colors.cloud,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  sectionBlock: {
    gap: 14,
  },
  planList: {
    gap: 14,
  },
  planCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    backgroundColor: "rgba(10, 27, 51, 0.88)",
    padding: 18,
    gap: 16,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planTitleGroup: {
    flex: 1,
    gap: 7,
  },
  planName: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900",
  },
  planDescription: {
    color: colors.mist,
    fontSize: 13,
    lineHeight: 19,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  price: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
  },
  creditTotal: {
    color: colors.gold,
    fontSize: typography.body,
    fontWeight: "800",
    paddingBottom: 5,
  },
  usageGrid: {
    flexDirection: "row",
    gap: 10,
  },
  usageTile: {
    flex: 1,
    minHeight: 86,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.overlay,
    padding: 14,
    justifyContent: "space-between",
  },
  usageValue: {
    color: colors.white,
    fontSize: 23,
    fontWeight: "900",
  },
  usageLabel: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  featureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  featureText: {
    flex: 1,
    color: colors.cloud,
    fontSize: 14,
    lineHeight: 19,
  },
  planButton: {
    alignItems: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    paddingVertical: 14,
  },
  planButtonText: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.86,
  },
  errorMessage: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  successMessage: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  notePanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 18,
    gap: 8,
  },
  noteTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "800",
  },
  noteText: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
});
