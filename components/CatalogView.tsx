"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { categories, products, type Category } from "@/lib/content";
import ProductCard from "@/components/ProductCard";
import CatalogSort from "@/components/CatalogSort";
export default function CatalogView() {
  const params = useSearchParams(); const router = useRouter(); const [search, setSearch] = useState(params.get("q") || "");
  const category = (categories.some((item) => item.id === params.get("category")) ? params.get("category") : "all") as Category;
  const query = (params.get("q") || "").trim().toLocaleLowerCase("ru");
  const sort = params.get("sort") || "popular";
  useEffect(() => setSearch(params.get("q") || ""), [params]);
  function update(key: string, value: string) { const next = new URLSearchParams(params.toString()); if (value && value !== "all" && value !== "popular") next.set(key, value); else next.delete(key); router.push(`/catalog${next.toString() ? `?${next}` : ""}`); }
  const filtered = products.filter((product) => (category === "all" || product.category === category) && (!query || `${product.title} ${product.description} ${product.categoryLabel}`.toLocaleLowerCase("ru").includes(query)));
  if (sort === "price-asc") filtered.sort((a,b) => a.price-b.price);
  if (sort === "price-desc") filtered.sort((a,b) => b.price-a.price);
  if (sort === "name") filtered.sort((a,b) => a.title.localeCompare(b.title, "ru"));
  return <main id="main" className="container catalog-page"><nav className="breadcrumbs"><Link href="/">Главная</Link><span>/</span>Каталог</nav><div className="catalog-heading"><div><span className="shop-eyebrow">Найдите свой праздник</span><h1>Каталог<span className="heading-dot">.</span></h1><p>Готовые идеи, которые можно адаптировать под ваш повод.</p></div></div><div className="catalog-layout"><aside className="catalog-sidebar"><h2>Категории</h2><nav aria-label="Категории товаров">{categories.map((item) => <button type="button" key={item.id} className={category === item.id ? "active" : ""} onClick={() => update("category", item.id)}>{item.label}<span>{item.id === "all" ? products.length : products.filter((p) => p.category === item.id).length}</span></button>)}</nav><div className="catalog-sidebar__help"><strong>Нужна своя идея?</strong><p>Расскажите нам о событии, и мы подготовим оформление по вашим пожеланиям.</p><Link href="/contacts">Написать нам ↗</Link></div></aside><div className="catalog-main"><div className="catalog-tools"><form onSubmit={(e) => { e.preventDefault(); update("q", search.trim()); }}><input aria-label="Найти товар" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по товарам"/><button type="submit">⌕</button></form><CatalogSort value={sort} onChange={(value) => update("sort", value)}/></div><div className="catalog-mobile-chips">{categories.map((item) => <button key={item.id} type="button" onClick={() => update("category", item.id)} className={category === item.id ? "active" : ""}>{item.label}</button>)}</div><p className="catalog-count">Найдено: {filtered.length}</p>{filtered.length ? <div className="product-grid product-grid--catalog">{filtered.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="shop-empty"><h2>Ничего не нашлось</h2><p>Попробуйте другой запрос или вернитесь ко всем товарам.</p><Link href="/catalog" className="shop-button">Все товары ↗</Link></div>}<p className="price-note">Цены примерные. Итоговая стоимость зависит от выбранных деталей и доставки.</p></div></div></main>;
}
