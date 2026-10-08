import { NextResponse } from "next/server";
import { paymentConfig } from "@/lib/payment/config";
export const runtime = "nodejs";
export async function GET() { const { mode, deliveryFee } = paymentConfig(); return NextResponse.json({ mode, deliveryFee }); }
