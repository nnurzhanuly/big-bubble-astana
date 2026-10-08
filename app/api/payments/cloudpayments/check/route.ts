import { NextResponse } from "next/server";
import { field, verifiedNotification } from "@/lib/payment/cloudpayments";
import { getOrder } from "@/lib/payment/store";
export const runtime = "nodejs";
export async function POST(request: Request) { const data = await verifiedNotification(request); if (!data) return NextResponse.json({ error: "Invalid signature" }, { status: 401 }); const order = await getOrder(field(data, "InvoiceId")); if (!order) return NextResponse.json({ code: 10 }); if (order.mode !== "cloudpayments" || order.status !== "pending_payment") return NextResponse.json({ code: 13 }); if (Number(field(data, "Amount")) !== order.total || field(data, "Currency") !== "KZT") return NextResponse.json({ code: 12 }); return NextResponse.json({ code: 0 }); }
