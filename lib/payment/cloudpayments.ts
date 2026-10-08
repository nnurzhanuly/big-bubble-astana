import { createHmac, timingSafeEqual } from "node:crypto";
import { paymentConfig } from "./config";
export type Notification = Record<string, unknown>;
export async function verifiedNotification(request: Request): Promise<Notification | null> {
  const config = paymentConfig(); const secret = process.env.CLOUDPAYMENTS_API_SECRET;
  if (config.mode !== "cloudpayments" || !secret) return null;
  const raw = await request.text(); if (raw.length > 32000) return null;
  const signature = request.headers.get("content-hmac"); if (!signature) return null;
  const expected = createHmac("sha256", secret).update(raw, "utf8").digest();
  let actual: Buffer; try { actual = Buffer.from(signature, "base64"); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  if (request.headers.get("content-type")?.includes("application/json")) { try { const data: unknown = JSON.parse(raw); return data && typeof data === "object" && !Array.isArray(data) ? data as Notification : null; } catch { return null; } }
  return Object.fromEntries(new URLSearchParams(raw));
}
export function field(data: Notification, name: string): string { const value = data[name]; return typeof value === "string" || typeof value === "number" ? String(value) : ""; }
