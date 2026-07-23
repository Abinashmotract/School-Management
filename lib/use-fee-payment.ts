import {
  initiateChildPayment,
  initiateStudentPayment,
  verifyOnlinePayment,
  type PaymentInitiateResponse,
  type PaymentOptions,
} from "@/lib/payment-api";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

type PayContext = {
  studentId?: string;
  session?: string;
  installmentId?: string;
};

export function useFeePayment(options: PaymentOptions | null) {
  const [paying, setPaying] = useState(false);

  const runPayment = useCallback(
    async (ctx: PayContext) => {
      if (!options?.paymentEnabled) {
        Alert.alert("Online payment", "Online fee payment is not enabled for your school.");
        return;
      }

      const pending = Number(options.feesDetails?.totalPendingAmount || 0);
      if (pending <= 0) {
        Alert.alert("Online payment", "No pending fees to pay.");
        return;
      }

      setPaying(true);
      try {
        const payload = {
          session: ctx.session || options.session,
          installmentId: ctx.installmentId,
        };

        let result: PaymentInitiateResponse;
        if (ctx.studentId) {
          result = await initiateChildPayment(ctx.studentId, payload);
        } else {
          result = await initiateStudentPayment(payload);
        }

        if (result.paymentUrl) {
          await WebBrowser.openBrowserAsync(result.paymentUrl);
        }

        if (result.transactionId) {
          const verified = await verifyOnlinePayment(result.transactionId);
          const status = verified.transaction?.status || "unknown";
          if (status === "success") {
            Alert.alert("Payment successful", "Your fee payment was recorded successfully.");
          } else {
            Alert.alert(
              "Payment status",
              verified.message ||
                "Payment submitted. If amount was deducted, it will reflect shortly."
            );
          }
        } else {
          Alert.alert("Payment", result.message || "Could not start payment.");
        }

        return result;
      } catch (e) {
        Alert.alert(
          "Payment failed",
          e instanceof Error ? e.message : "Could not initiate payment."
        );
        return null;
      } finally {
        setPaying(false);
      }
    },
    [options]
  );

  return { paying, runPayment };
}
