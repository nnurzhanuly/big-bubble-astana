import type { Metadata } from "next";
import CheckoutView from "@/components/CheckoutView";
export const metadata: Metadata = { title: "Оформление и оплата" };
export default function Page() { return <CheckoutView/>; }
