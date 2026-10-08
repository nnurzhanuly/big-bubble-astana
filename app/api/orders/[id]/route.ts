import { NextResponse } from "next/server";
import { getOrder, publicOrder } from "@/lib/payment/store";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const token = new URL(request.url).searchParams.get("token"); const order = await getOrder(id); if (!order || !token || token !== order.accessToken) return NextResponse.json({ error: "Заказ не найден." }, { status: 404 }); return NextResponse.json(publicOrder(order)); }
