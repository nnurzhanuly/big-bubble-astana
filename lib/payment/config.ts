export type PaymentMode = "demo" | "cloudpayments" | "unavailable";
export function paymentConfig(): { mode: PaymentMode; deliveryFee: number; terminalId: string | null } {
  const deliveryFee = 0; // Delivery is included in the 10% assembly and packing service.
  if (process.env.PAYMENT_MODE === "demo") return { mode: "demo", deliveryFee, terminalId: null };
  const terminalId = process.env.CLOUDPAYMENTS_TERMINAL_ID;
  if (process.env.PAYMENT_MODE === "cloudpayments" && process.env.PAYMENTS_LIVE_ENABLED === "true" && process.env.PRICES_APPROVED === "true" && terminalId && process.env.CLOUDPAYMENTS_API_SECRET) return { mode: "cloudpayments", deliveryFee, terminalId };
  return { mode: "unavailable", deliveryFee, terminalId: null };
}
