import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorCode, finishTransaction, useIAP } from "expo-iap";
import type { Purchase } from "expo-iap";
import { httpsCallable } from "firebase/functions";

import { creditPlans } from "../constants/creditPlans";
import { functions } from "../utils/firebase";

const productIds = creditPlans.map((plan) => plan.id);
const prepareAppleIAP = httpsCallable<void, { appAccountToken: string }>(
  functions,
  "prepareAppleIAP",
);
const verifyAppleIAP = httpsCallable<
  { productId: string; transactionId: string; purchaseToken: string },
  { alreadyFulfilled: boolean; verified: boolean }
>(functions, "verifyAppleIAP");

export type StoreRenderProps = {
  connected: boolean;
  errorMessage: string | null;
  localizedPrices: Record<string, string>;
  productAvailable: (productId: string) => boolean;
  productsLoaded: boolean;
  purchasingProductId: string | null;
  purchaseProduct: (productId: string) => Promise<void>;
  successMessage: string | null;
};

type StoreProps = {
  children: (props: StoreRenderProps) => ReactNode;
};

export default function Store({ children }: Readonly<StoreProps>) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  const processingTransactions = useRef(new Set<string>());

  const processPurchase = useCallback(async (purchase: Purchase) => {
    if (!purchase.purchaseToken || !purchase.transactionId) {
      setErrorMessage("Apple did not return signed transaction data.");
      setPurchasingProductId(null);
      return;
    }
    if (processingTransactions.current.has(purchase.transactionId)) return;

    processingTransactions.current.add(purchase.transactionId);
    try {
      const response = await verifyAppleIAP({
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        purchaseToken: purchase.purchaseToken,
      });
      if (!response.data.verified) {
        throw new Error("Failed to verify purchase.");
      }

      await finishTransaction({ purchase, isConsumable: true });
      setSuccessMessage(
        response.data.alreadyFulfilled
          ? "Purchase restored successfully."
          : "Credits added to your balance.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to verify purchase.");
    } finally {
      processingTransactions.current.delete(purchase.transactionId);
      setPurchasingProductId(null);
    }
  }, []);

  const { availablePurchases, connected, products, fetchProducts, getAvailablePurchases, requestPurchase } = useIAP({
    onPurchaseSuccess: (purchase) => void processPurchase(purchase),
    onPurchaseError: (error) => {
      setPurchasingProductId(null);
      if (error.code !== ErrorCode.UserCancelled) {
        setErrorMessage(error.message || "Unable to complete purchase.");
      }
    },
  });

  useEffect(() => {
    if (!connected) return;

    void Promise.all([
      fetchProducts({ skus: productIds, type: "in-app" }),
      getAvailablePurchases({ onlyIncludeActiveItemsIOS: false }),
    ])
      .catch(() => setErrorMessage("Unable to load App Store products."))
      .finally(() => setProductsLoaded(true));
  }, [connected, fetchProducts, getAvailablePurchases]);

  useEffect(() => {
    availablePurchases.forEach((purchase) => void processPurchase(purchase));
  }, [availablePurchases, processPurchase]);

  const localizedPrices = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product.displayPrice])),
    [products],
  );
  const availableProductIds = useMemo(
    () => new Set(products.map((product) => product.id)),
    [products],
  );

  const purchaseProduct = useCallback(
    async (productId: string) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setPurchasingProductId(productId);

      try {
        if (!availableProductIds.has(productId)) {
          throw new Error("This credit pack is unavailable from the App Store.");
        }
        const { data } = await prepareAppleIAP();
        await requestPurchase({
          request: {
            apple: { sku: productId, appAccountToken: data.appAccountToken },
          },
          type: "in-app",
        });
      } catch (error) {
        setPurchasingProductId(null);
        setErrorMessage(error instanceof Error ? error.message : "Unable to start purchase.");
      }
    },
    [availableProductIds, requestPurchase],
  );

  return children({
    connected,
    errorMessage,
    localizedPrices,
    productAvailable: (productId) => availableProductIds.has(productId),
    productsLoaded,
    purchasingProductId,
    purchaseProduct,
    successMessage,
  });
}
