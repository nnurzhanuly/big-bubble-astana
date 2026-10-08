import type { Metadata } from "next";
import CartView from "@/components/CartView";
export const metadata: Metadata = { title: "Корзина" };
export default function Page() { return <CartView/>; }
