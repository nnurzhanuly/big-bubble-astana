import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { products } from "@/lib/content";
import { bundleDescription, bundlePrice, parseBundle } from "@/lib/builder";
import { parseScene, sceneDescription, scenePrice } from "@/lib/scene";
import { paymentConfig } from "@/lib/payment/config";
import { createAccessToken, createOrder, publicOrder, type StoredOrder } from "@/lib/payment/store";
export const runtime = "nodejs";
const findProduct = (id: string) => products.find((product) => product.id === id);
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 16000) return NextResponse.json({ error: "Заказ слишком большой." }, { status: 413 });
  const config = paymentConfig();
  if (config.mode === "unavailable") return NextResponse.json({ error: "Оплата пока не настроена. Попробуйте позже." }, { status: 503 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Некорректные данные заказа." }, { status: 400 }); }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return NextResponse.json({ error: "Некорректные данные заказа." }, { status: 400 });
  const body = raw as Record<string, unknown>;
  const str = (key: string) => typeof body[key] === "string" ? (body[key] as string).trim() : "";
  const name = str("name"), phone = str("phone"), delivery = str("delivery"), address = str("address"), date = str("date"), comment = str("comment"), website = str("website");
  if (website) return NextResponse.json({ id: "BB-OK" }, { status: 201 });
  if (name.length < 2 || name.length > 80 || /[\r\n]/.test(name)) return NextResponse.json({ error: "Введите имя от 2 до 80 символов." }, { status: 400 });
  if (!/^[+\d\s()\-]+$/.test(phone) || phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 12) return NextResponse.json({ error: "Проверьте номер телефона." }, { status: 400 });
  if (delivery !== "delivery" && delivery !== "pickup") return NextResponse.json({ error: "Выберите способ получения." }, { status: 400 });
  if (delivery === "delivery" && address.length < 5) return NextResponse.json({ error: "Укажите адрес доставки." }, { status: 400 });
  if (address.length > 200 || comment.length > 1000) return NextResponse.json({ error: "Проверьте адрес или комментарий." }, { status: 400 });
  if (date) { const parsed = new Date(`${date}T00:00:00.000Z`); if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date || date < new Date().toISOString().slice(0,10)) return NextResponse.json({ error: "Проверьте дату." }, { status: 400 }); }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) return NextResponse.json({ error: "Корзина пуста или содержит слишком много товаров." }, { status: 400 });
  const items: StoredOrder["items"] = [];
  for (const rawItem of body.items) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) return NextResponse.json({ error: "Проверьте товары в корзине." }, { status: 400 });
    const item = rawItem as Record<string, unknown>;
    if (typeof item.id !== "string" || !Number.isInteger(item.quantity) || (item.quantity as number) < 1 || (item.quantity as number) > 99 || items.some((entry) => entry.id === item.id)) return NextResponse.json({ error: "Проверьте товары в корзине." }, { status: 400 });
    if (item.type === "bundle") { const config = parseBundle(item.config); if (!/^bundle-[0-9a-f-]{36}$/.test(item.id) || !config) return NextResponse.json({ error: "Проверьте состав набора." }, { status: 400 }); items.push({ id: item.id, title: `Набор по вашему дизайну: ${bundleDescription(config)}`, quantity: item.quantity as number, unitPrice: bundlePrice(config), configuration: config }); continue; }
    if (item.type === "scene") { const config = parseScene(item.config); if (!/^scene-[0-9a-f-]{36}$/.test(item.id) || !config) return NextResponse.json({ error: "Проверьте состав набора." }, { status: 400 }); items.push({ id: item.id, title: `Набор по вашему дизайну: ${sceneDescription(config)}`, quantity: item.quantity as number, unitPrice: scenePrice(config), configuration: config }); continue; }
    const product = findProduct(item.id);
    if (!product) return NextResponse.json({ error: "Проверьте товары в корзине." }, { status: 400 });
    items.push({ id: product.id, title: product.title, quantity: item.quantity as number, unitPrice: product.price });
  }
  const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const deliveryFee = delivery === "delivery" ? config.deliveryFee : 0;
  const id = `BB-${randomBytes(16).toString("hex").toUpperCase()}`;
  const order: StoredOrder = { id, accessToken: createAccessToken(), createdAt: new Date().toISOString(), status: "pending_payment", mode: config.mode, name, phone, delivery, address: address || null, date: date || null, comment, items, itemsTotal, deliveryFee, total: itemsTotal + deliveryFee, currency: "KZT" };
  try { await createOrder(order); } catch { return NextResponse.json({ error: "Не удалось создать заказ. Попробуйте позже." }, { status: 500 }); }
  return NextResponse.json({ ...publicOrder(order), accessToken: order.accessToken, terminalId: config.terminalId, description: `Оплата заказа ${id}`, phone }, { status: 201 });
}
