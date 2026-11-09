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

export type StudentRefund = {
  refundId: string;
  feesTypeName?: string;
  amount: number;
  paidAmount?: number;
  status: string;
  claimType?: string;
  payoutMode?: string;
  payoutStatus?: string;
  voucherNo?: string;
  refundPercent?: number;
  reason?: string;
  createdAt?: string | null;
  message?: string;
};

const REFUND_STATUS: Record<string, string> = {
  pending: "Pending review",
  pending_l2: "Pending approval",
  pending_l3: "Pending principal",
  approved: "Approved",
  rejected: "Rejected",
  payout: "Payout in progress",
  processed: "Settled",
  failed: "Payout failed",
  cancelled: "Cancelled",
};

const REFUND_METHOD: Record<string, string> = {
  online: "Online",
  cod: "Cash",
  cheque: "Cheque",
  bank: "Bank",
};

export function refundStatusLabel(status?: string) {
  return REFUND_STATUS[status || ""] || status || "Refund";
}

export function refundMethodLabel(mode?: string) {
  return REFUND_METHOD[mode || ""] || mode || "";
}

export async function fetchStudentRefunds(session?: string): Promise<StudentRefund[]> {
  const response = await apiGet<{ success?: boolean; data?: StudentRefund[] }>(
    "/student/portal/fees/refunds",
    { session }
  );
  return Array.isArray(response?.data) ? response.data : [];
}

export async function fetchChildRefunds(studentId: string, session?: string): Promise<StudentRefund[]> {
  const response = await apiGet<{ success?: boolean; data?: StudentRefund[] }>(
    `/parent/portal/children/${encodeURIComponent(studentId)}/fees/refunds`,
    { session }
  );
  return Array.isArray(response?.data) ? response.data : [];
}
