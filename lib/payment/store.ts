import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import type { PaymentMode } from "./config";
export type OrderStatus = "pending_payment" | "paid" | "paid_demo" | "failed";
export type StoredOrder = { id: string; accessToken: string; createdAt: string; paidAt?: string; paymentTransactionId?: string; status: OrderStatus; mode: PaymentMode; name: string; phone: string; delivery: "delivery" | "pickup"; address: string | null; date: string | null; comment: string; items: { id: string; title: string; quantity: number; unitPrice: number; configuration?: import("../builder").BundleConfig | import("../scene").SceneConfig }[]; itemsTotal: number; deliveryFee: number; total: number; currency: "KZT" };
const directory = () => path.join(process.cwd(), "data", "paid-orders");
const orderPath = (id: string) => { if (!/^BB-[0-9A-F]{32}$/.test(id)) throw new Error("Invalid order id"); return path.join(directory(), `${id}.json`); };
export const createAccessToken = () => randomBytes(24).toString("hex");
export async function createOrder(order: StoredOrder) { await mkdir(directory(), { recursive: true, mode: 0o700 }); await writeFile(orderPath(order.id), JSON.stringify(order), { flag: "wx", mode: 0o600 }); }
export async function getOrder(id: string): Promise<StoredOrder | null> { try { return JSON.parse(await readFile(orderPath(id), "utf8")) as StoredOrder; } catch { return null; } }
export async function saveOrder(order: StoredOrder) { const tmp = `${orderPath(order.id)}.${randomBytes(8).toString("hex")}.tmp`; await writeFile(tmp, JSON.stringify(order), { mode: 0o600 }); await rename(tmp, orderPath(order.id)); }
export function publicOrder(order: StoredOrder) { return { id: order.id, status: order.status, mode: order.mode, total: order.total, currency: order.currency, createdAt: order.createdAt, paidAt: order.paidAt || null }; }
