import { useEffect } from "react";
import { View } from 'react-native';
import { useIAP, ErrorCode, finishTransaction, PurchaseError, type Purchase, VerifyPurchaseResultIOS } from 'expo-iap';
import { colors } from "../constants/theme";
import AppButton from "./AppButton";

type OptionalPurchase = Purchase | null | undefined;

export default function Store() {
    const { connected, products, fetchProducts, requestPurchase, verifyPurchase } = useIAP({
        onPurchaseSuccess: async (purchase) => {
            const result = await verifyPurchase({
                apple: { sku: purchase.productId },
            });
            if (isVerifyResultIOS(result)) {
                if (!result.isValid) throw new Error("Failed to verify purchase");
            }
            
            await finishTransaction({ purchase, isConsumable: true });
        },
        onPurchaseError: async (error) => {
            handlePurchaseError(error);
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
                onPress={() =>
                requestPurchase({
                    request: {
                        apple: { sku: product.id },
                        google: { skus: [product.id] },
                    },
                    type: 'in-app',
                })}
                bgColor={colors.cyan}
                textColor={colors.ink}
            />
        ))}
        </View>
    );
}

function handlePurchaseError(error: PurchaseError) {
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
}

function isVerifyResultIOS(value: unknown): value is VerifyPurchaseResultIOS {
    return typeof value === "object" && 
    value !== null && 
    "isValid" in value && "jwsRepresentation" in value && "receiptData" in value && "latestTransaction" in value &&
    typeof value.isValid === "boolean" && typeof value.jwsRepresentation === "string" && typeof value.receiptData === "string"; // TODO: optional latestTransaction field is not checked due to complex check for Purchase | null | undefined
}
