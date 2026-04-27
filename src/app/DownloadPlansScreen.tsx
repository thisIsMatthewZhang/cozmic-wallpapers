import { Pressable, StyleSheet, Text, View } from "react-native";

import { SectionHeader } from "../components/SectionHeader";
import { colors, radii, typography } from "../constants/theme";
import type { CreditPlan } from "../types/wallpaper";
import { creditPlans } from "../utils/mockData";

type DownloadPlansScreenProps = {
  onBack: () => void;
};

function PlanCard({ plan }: Readonly<{ plan: CreditPlan }>) {
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
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.creditTotal}>{plan.credits} credits</Text>
      </View>

      <View style={styles.usageGrid}>
        <View style={styles.usageTile}>
          <Text style={styles.usageValue}>{plan.generationRuns}</Text>
          <Text style={styles.usageLabel}>generation runs</Text>
        </View>
        <View style={styles.usageTile}>
          <Text style={styles.usageValue}>{plan.downloads}</Text>
          <Text style={styles.usageLabel}>final downloads</Text>
        </View>
      </View>

      <View style={styles.featureList}>
        {plan.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: plan.accent }]} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Pressable style={({ pressed }) => [styles.planButton, pressed && styles.pressed]}>
        <Text style={styles.planButtonText}>Choose package</Text>
      </Pressable>
    </View>
  );
}

export function DownloadPlansScreen({ onBack }: Readonly<DownloadPlansScreenProps>) {
  return (
    <>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <View style={styles.balancePill}>
          <Text style={styles.balanceLabel}>Dummy balance</Text>
          <Text style={styles.balanceValue}>84 credits</Text>
        </View>
      </View>

      <View style={styles.heroPanel}>
        <View style={styles.heroOrbit} />
        <Text style={styles.kicker}>DOWNLOAD PLANS</Text>
        <Text style={styles.headline}>Buy credits, then spend them when a wallpaper is worth keeping.</Text>
        <Text style={styles.subheadline}>
          Credits can cover generation attempts, upscales, and final downloads. These packages are placeholder examples for the future payment flow.
        </Text>
      </View>

      <View style={styles.explainerGrid}>
        <View style={styles.explainerTile}>
          <Text style={styles.explainerValue}>4</Text>
          <Text style={styles.explainerLabel}>credits to generate variants</Text>
        </View>
        <View style={styles.explainerTile}>
          <Text style={styles.explainerValue}>5</Text>
          <Text style={styles.explainerLabel}>credits to download final art</Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          eyebrow="Credit Packages"
          title="Pick a pack for the way you create"
          description="Package values are dummy data for now, but the layout is ready for product, App Store, or Stripe-backed pricing later."
        />
        <View style={styles.planList}>
          {creditPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>
      </View>

      <View style={styles.notePanel}>
        <Text style={styles.noteTitle}>How the wallet could work</Text>
        <Text style={styles.noteText}>
          Credits stay in the account balance. A generation run reserves credits first, while downloads charge only when the user saves the finished wallpaper.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.panelSoft,
  },
  backButtonText: {
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
