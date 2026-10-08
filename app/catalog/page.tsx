import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogView from "@/components/CatalogView";
export const metadata: Metadata = { title: "Каталог шаров и оформления" };
export default function Page() { return <Suspense fallback={<main id="main" className="container catalog-page"><h1>Каталог</h1></main>}><CatalogView/></Suspense>; }
