"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/content";
import { useShop } from "@/components/ShopProvider";
export default function ProductCard({ product }: { product: Product }) {
  const { add, favorites, toggleFavorite, ready } = useShop(); const [added, setAdded] = useState(false);
  function addItem() { add(product.id); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }
  return <article className="product-card"><div className="product-card__visual"><Link href={`/catalog/${product.id}`} aria-label={`Открыть ${product.title}`}><Image src={product.image} alt={product.alt} fill sizes="(max-width: 580px) 50vw, (max-width: 900px) 33vw, 25vw" /></Link>{product.badge && <span className="product-card__badge">{product.badge}</span>}<button className={`product-card__favorite ${ready && favorites.includes(product.id) ? "is-active" : ""}`} type="button" onClick={() => toggleFavorite(product.id)} aria-label={ready && favorites.includes(product.id) ? `Убрать ${product.title} из избранного` : `Добавить ${product.title} в избранное`} aria-pressed={ready && favorites.includes(product.id)}>{ready && favorites.includes(product.id) ? "♥" : "♡"}</button></div><div className="product-card__body"><span className="product-card__category">{product.categoryLabel}</span><Link href={`/catalog/${product.id}`} className="product-card__title">{product.title}</Link><span className="product-card__price">от {formatPrice(product.price)}</span><button className={`product-card__add ${added ? "is-added" : ""}`} type="button" onClick={addItem}>{added ? "Добавлено ✓" : "В корзину"} <span aria-hidden="true">↗</span></button></div></article>;
}
