"use client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/components/ShopProvider";
import { products } from "@/lib/content";
export default function FavoritesView() { const { favorites, ready } = useShop(); const selected = products.filter((item) => favorites.includes(item.id)); return <main id="main" className="container simple-page"><nav className="breadcrumbs"><Link href="/">Главная</Link><span>/</span>Избранное</nav><span className="shop-eyebrow">Ваши идеи</span><h1>Избранное<span className="heading-dot">.</span></h1>{ready && selected.length ? <div className="product-grid">{selected.map((item) => <ProductCard product={item} key={item.id}/>)}</div> : ready ? <div className="shop-empty"><span>♡</span><h2>Здесь пока пусто</h2><p>Отмечайте понравившиеся товары сердечком — они останутся здесь.</p><Link href="/catalog" className="shop-button">Перейти в каталог ↗</Link></div> : <p>Загружаем избранное…</p>}</main>; }
