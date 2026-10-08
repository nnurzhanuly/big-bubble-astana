"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { categories } from "@/lib/content";
import { useShop } from "@/components/ShopProvider";
import { CartIcon } from "@/components/CartIcon";
export function SiteHeader() {
  const pathname = usePathname(); const router = useRouter();
  const { cart, favorites, ready } = useShop(); const [menuOpen, setMenuOpen] = useState(false); const [query, setQuery] = useState("");
  const close = () => setMenuOpen(false);
  function submit(event: FormEvent) { event.preventDefault(); close(); router.push(`/catalog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); }
  return <>
    <header className="shop-header">
      <div className="container shop-header__row">
        <Link href="/" className="shop-brand" onClick={close} aria-label="Big Bubble — главная">big bubble<span>.</span><small>А С Т А Н А</small></Link>
        <form className="shop-search" role="search" onSubmit={submit}><span aria-hidden="true">⌕</span><input aria-label="Поиск по каталогу" placeholder="Что ищете для праздника?" value={query} onChange={(e) => setQuery(e.target.value)} /><button type="submit">Найти</button></form>
        <div className="shop-header__actions"><Link href="/favorites" className={pathname === "/favorites" ? "active" : ""} aria-label={`Избранное: ${ready ? favorites.length : 0}`}><span className="shop-icon">♡</span><span>Избранное</span>{ready && favorites.length > 0 && <b>{favorites.length}</b>}</Link><Link href="/cart" className={pathname === "/cart" ? "active" : ""} aria-label={`Корзина: ${ready ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0}`}><span className="shop-icon shop-icon--cart"><CartIcon /></span><span>Корзина</span>{ready && cart.length > 0 && <b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b>}</Link></div>
        <button className="shop-menu-button" type="button" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>
      <div className={`shop-nav-wrap ${menuOpen ? "is-open" : ""}`}><nav className="container shop-nav" aria-label="Навигация"><Link className={pathname === "/catalog" ? "active" : ""} href="/catalog" onClick={close}>Весь каталог</Link>{categories.slice(1).map((category) => <Link key={category.id} href={`/catalog?category=${category.id}`} onClick={close}>{category.label}</Link>)}<Link className={pathname === "/constructor" ? "active" : ""} href="/constructor" onClick={close}>Конструктор</Link><Link href="/delivery" onClick={close}>Доставка и оплата</Link><Link href="/contacts" onClick={close}>Контакты</Link><div className="shop-nav__mobile"><Link href="/favorites" onClick={close}>Избранное</Link><Link href="/cart" onClick={close}>Корзина</Link></div></nav></div>
    </header>
  </>;
}
export function SiteFooter() { return <footer className="shop-footer"><div className="container shop-footer__grid"><div><Link href="/" className="shop-brand shop-brand--light">big bubble<span>.</span><small>А С Т А Н А</small></Link><p>Поводы бывают разными. Красота момента — в деталях.</p><span className="shop-footer__star">✳</span></div><nav aria-label="Каталог"><strong>Каталог</strong><Link href="/catalog">Все товары</Link><Link href="/constructor">Конструктор набора</Link>{categories.slice(1).map((category) => <Link key={category.id} href={`/catalog?category=${category.id}`}>{category.label}</Link>)}</nav><nav aria-label="Покупателям"><strong>Покупателям</strong><Link href="/delivery">Доставка и оплата</Link><Link href="/contacts">Контакты</Link><Link href="/favorites">Избранное</Link><Link href="/cart">Корзина</Link></nav></div><div className="container shop-footer__bottom"><span>© Big Bubble Astana</span><span>Цены примерные. Тестовая оплата без списания средств.</span></div></footer>; }
