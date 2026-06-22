import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../constants/theme";

type PolicySection = {
  title: string;
  notes: string[];
};

const policySections: PolicySection[] = [
  {
    title: "Types of Data Collected",
    notes: [
      "Identifier data: generated app user ID, local session state, and any device or session identifiers needed to provide app functionality.",
      "Wallpaper generation data: user prompts, cleaned prompts returned by the preflight classifier, requested image count, resolution, device aspect ratio bucket, generation job ID, job status, error messages, token usage metadata, generated image paths, and generated wallpaper files.",
      "Credit and payment data: credit balance, generation credit cost, credit purchase history, App Store transaction identifiers, transaction status, receipt metadata, refund records, and other records needed to fulfill purchases. Payment credentials are processed by Apple and are not stored by the app.",
      "Device and permission data: media library/photo permission status when the user saves wallpapers, temporary local cache files used during download, and operational/security data that Firebase, Google Cloud, Apple, app stores, or device platforms may process, such as IP address, device identifiers, logs, crash data, or fraud signals.",
      "Optional/user-directed data: customer support messages, privacy request details, and explicit permission to showcase selected wallpapers if that feature is added.",
    ],
  },
  {
    title: "Purpose of Data Collection",
    notes: [
      "Provide generated app user ID creation, session persistence, and user-scoped app functionality.",
      "Classify prompts for safety, generate wallpapers, store generated results, display completed jobs, and allow users to save wallpapers to their photo library.",
      "Manage credit balances, calculate generation costs, process credit purchases through Apple In-App Purchase, confirm payment status, handle refunds, prevent fraud, and respond to purchase support requests.",
      "Operate, secure, debug, and improve the app, including abuse prevention, service monitoring, troubleshooting, and compliance with app store, payment, tax, accounting, and legal obligations.",
    ],
  },
  {
    title: "Data Usage",
    notes: [
      "Use account data to identify the user, personalize the signed-in experience, secure account access, and associate generation jobs, storage paths, and credit balances with the correct account.",
      "Send prompts and generation settings to Google GenAI/Gemini services to classify prompts and generate wallpaper images. Generated images are stored in Firebase Storage and referenced from Firestore generation jobs.",
      "Use credit and App Store transaction records to deliver purchased credits, keep account balances accurate, reconcile transactions, and support refunds, disputes, and customer service.",
      "Decide before launch whether prompts, generated images, analytics, or support data will be used for model training, product research, internal review, or public showcases. If not, say so clearly; if yes, describe the purpose and consent/opt-out path.",
    ],
  },
  {
    title: "Data Storage and Security",
    notes: [
      "Account, generation job, credit balance, and image path records are stored in Firebase/Google Cloud services. Generated wallpapers are stored in Firebase Storage under user-specific generation paths.",
      "Purchases are processed through Apple In-App Purchase. The app stores only the App Store transaction references and purchase records needed for fulfillment, support, accounting, fraud prevention, and legal compliance.",
      "Saved wallpapers are downloaded to a temporary device cache before being saved to the user's photo library; the temporary directory is deleted after the save flow completes.",
      "Define retention periods for account records, generation jobs, generated images, payment records, support messages, logs, and deletion requests before release.",
      "Before launch, replace temporary Firestore and Storage development rules with production rules. Do not promise production-grade access controls until authenticated, user-scoped rules are deployed and verified.",
    ],
  },
  {
    title: "Data Sharing and Disclosure",
    notes: [
      "Service providers may include Firebase/Google Cloud for authentication, database, cloud functions, storage, logs, and infrastructure; Google GenAI/Gemini for prompt classification and image generation; and Apple or other app stores for payment processing, purchase verification, refunds, distribution, diagnostics, and review processes.",
      "Share data when needed to provide the app, process payments, generate wallpapers, secure the service, prevent fraud or abuse, comply with law, respond to legal requests, enforce terms, complete a business transfer, or act at the user's direction.",
      "If showcasing wallpapers is added, share or publish a user's wallpaper only with explicit permission and include a way to withdraw that permission for future use where practical.",
      "State whether the app uses third-party analytics, advertising, cross-app tracking, data brokers, or marketing SDKs. Current code does not show explicit analytics or advertising integrations, but store disclosures must include SDK behavior once dependencies are installed.",
    ],
  },
  {
    title: "User Rights and Choices",
    notes: [
      "Users should be able to request access, correction, export, or deletion of account data, generation history, generated images, support messages, and eligible purchase records.",
      "Explain that some payment, refund, fraud-prevention, tax, accounting, and legal records may need to be retained even after account deletion.",
      "Users can choose whether to provide photo/media library permission. Without permission, they can still generate wallpapers but may not be able to save them directly to the device library.",
      "Users can choose whether to grant permission to showcase wallpapers if that feature is added, and should be able to withdraw showcase consent for future use.",
      "Add region-specific privacy rights that apply to supported users, including California, EEA, UK, and any other launch regions.",
    ],
  },
  {
    title: "Policy Updates and Changes",
    notes: [
      "Explain how users will be notified when the policy changes, where the current policy can be viewed, and when updates become effective.",
      "Include a placeholder for the effective date and last updated date.",
    ],
  },
  {
    title: "Contact Information",
    notes: [
      "Add the support email, business or developer name, mailing address if required, and any privacy-specific contact method.",
      "Include instructions for submitting privacy requests, deletion requests, or questions about data practices.",
    ],
  },
];

export function PrivacyPolicyNotes() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Privacy Policy</Text>
        <Text style={styles.title}>Privacy Notes</Text>
        <Text style={styles.description}>
          This skeleton is a drafting aid and should be completed with the app's
          actual data practices before release.
        </Text>
      </View>

      <View style={styles.sectionList}>
        {policySections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.notes}>
              {section.notes.map((note) => (
                <View key={note} style={styles.noteRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.note}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    gap: 8,
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
    fontSize: typography.headline,
    fontWeight: "800",
  },
  description: {
    color: colors.mist,
    fontSize: typography.body,
    lineHeight: 21,
  },
  sectionList: {
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "800",
  },
  notes: {
    gap: 10,
  },
  noteRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  bullet: {
    backgroundColor: colors.cyan,
    borderRadius: 3,
    height: 6,
    marginTop: 8,
    width: 6,
  },
  note: {
    color: colors.stardust,
    flex: 1,
    fontSize: typography.body,
    lineHeight: 21,
  },
});
