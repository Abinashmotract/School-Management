import { apiGet, apiPost } from "@/lib/api-client";

export type PaymentFeeItem = {
  feesTypeId: string;
  feesTypeName?: string;
  pendingAmount?: number;
  paidAmount?: number;
};

export type PaymentInstallment = {
  installmentId: string;
  feesGroupId?: string;
  installmentNo?: number;
  installmentTitle?: string;
  dueDate?: string;
  totalPending?: number;
  totalDue?: number;
  isPaid?: boolean;
  feesItems?: PaymentFeeItem[];
};

export type PaymentVoucher = {
  studentVoucherId: string;
  title?: string;
  remainingAmount?: number;
  isPaid?: boolean;
};

export type PaymentFeesDetails = {
  hasPendingFees?: boolean;
  totalPendingAmount?: number;
  installments?: PaymentInstallment[];
  vouchers?: PaymentVoucher[];
};

export type PaymentOptions = {
  tenantId: string;
  session: string;
  paymentEnabled: boolean;
  feesDetails: PaymentFeesDetails;
};

export type PaymentInitiateResponse = {
  transactionId?: string;
  grandTotal?: number;
  subtotal?: number;
  paymentUrl?: string;
  paymentToken?: string;
  gatewayOrderId?: string;
  message?: string;
  isRetry?: boolean;
};

export type PaymentVerifyResponse = {
  message?: string;
  transaction?: {
    transactionId?: string;
    status?: string;
    grandTotal?: number;
  };
};

export async function fetchStudentPaymentOptions(session?: string): Promise<PaymentOptions> {
  return apiGet<PaymentOptions>("/student/portal/fees/payment-options", { session });
}

export async function initiateStudentPayment(payload: {
  session?: string;
  installmentId?: string;
  studentVoucherIds?: string[];
}): Promise<PaymentInitiateResponse> {
  return apiPost<PaymentInitiateResponse>("/student/portal/fees/pay/initiate", payload);
}

export async function fetchChildPaymentOptions(
  studentId: string,
  session?: string
): Promise<PaymentOptions> {
  return apiGet<PaymentOptions>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/fees/payment-options`,
    { session }
  );
}

export async function initiateChildPayment(
  studentId: string,
  payload: {
    session?: string;
    installmentId?: string;
    studentVoucherIds?: string[];
  }
): Promise<PaymentInitiateResponse> {
  return apiPost<PaymentInitiateResponse>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/fees/pay/initiate`,
    payload
  );
}

export async function verifyOnlinePayment(transactionId: string): Promise<PaymentVerifyResponse> {
  return apiPost<PaymentVerifyResponse>("/online-payment/portal/verify", { transactionId });
}

export async function getPaymentStatus(orderId: string) {
  return apiGet<{ status?: string; transaction?: PaymentVerifyResponse["transaction"] }>(
    `/online-payment/portal/status/${encodeURIComponent(orderId)}`
  );
}
