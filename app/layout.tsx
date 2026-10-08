import type { Metadata } from "next";
import { ShopProvider } from "@/components/ShopProvider";
import { SiteHeader, SiteFooter } from "@/components/SiteShell";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Big Bubble — каталог шаров и оформления в Астане", template: "%s | Big Bubble" }, description: "Каталог воздушных шаров, подарков и оформления в Астане. Выбирайте, добавляйте в корзину и отправляйте заявку на сайте." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body><ShopProvider><a className="skip-link" href="#main">Перейти к содержимому</a><SiteHeader/>{children}<SiteFooter/></ShopProvider></body></html>; }
