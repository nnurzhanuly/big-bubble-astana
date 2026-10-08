import type { Metadata } from "next";
import ConstructorView from "@/components/ConstructorView";
import "./constructor.css";
export const metadata: Metadata = { title: "Конструктор набора шаров" };
export default function Page() { return <ConstructorView/>; }
