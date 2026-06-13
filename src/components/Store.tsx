import { useEffect } from "react";
import { View } from 'react-native';
import { useIAP, ErrorCode, finishTransaction } from 'expo-iap';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { colors } from "../constants/theme";
import AppButton from "./AppButton";

const functions = getFunctions();
const prepareAppleIAP = httpsCallable<void, { appAccountToken: string }>(functions, "prepareAppleIAP");
const verifyAppleIAP = httpsCallable<
    { productId: string; transactionId: string; purchaseToken: string },
    { verified: boolean }
>(functions, "verifyAppleIAP");

export default function Store() {
    const { products, fetchProducts, requestPurchase } = useIAP({
        onPurchaseSuccess: async (purchase) => {
            if (!purchase.purchaseToken || !purchase.transactionId) {
                throw new Error("Apple did not return signed transaction data.");
            }
            const response = await verifyAppleIAP({
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                purchaseToken: purchase.purchaseToken,
            });
            if (!response.data.verified) {
                throw new Error("Failed to verify purchase.");
            }
            await finishTransaction({ purchase, isConsumable: true });
        },
        onPurchaseError: async (error) => {
            switch (error.code) {
                case ErrorCode.UserCancelled:
                    throw new Error("Purchase was cancelled by the user.");
                case ErrorCode.NetworkError:
                    throw new Error("There was a network error and your purchase was not successful.");
                case ErrorCode.PurchaseVerificationFailed:
                    throw new Error("Failed to verify purchase.");
                case ErrorCode.Pending:
                    throw new Error("An existing purchase is still pending.");
            }
        },
    });
    useEffect(() => {
        fetchProducts({ skus: ["planet", "star", "galaxy", "universe"], type: 'in-app'});
    }, []);

    return (
        <View>
        {products.map((product) => (
            <AppButton
                key={product.id}
                title={`${product.title} - ${product.displayPrice}`}
                onPress={async () => {
                const { data } = await prepareAppleIAP();
                await requestPurchase({
                    request: {
                        apple: { sku: product.id, appAccountToken: data.appAccountToken },
                        google: { skus: [product.id] },
                    },
                    type: 'in-app',
                });
                }}
                bgColor={colors.cyan}
                textColor={colors.ink}
            />
        ))}
        </View>
    );
}
