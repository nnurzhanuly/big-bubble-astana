"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories } from "@/lib/content";
import { useShop } from "@/components/ShopProvider";
import { CartIcon } from "@/components/CartIcon";
export function SiteHeader() {
  const pathname = usePathname(); const router = useRouter();
  const { cart, favorites, ready } = useShop(); const [menuOpen, setMenuOpen] = useState(false); const [query, setQuery] = useState("");
  const close = () => setMenuOpen(false);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    const desktop = window.matchMedia("(min-width: 1101px)");
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener("keydown", onEscape);
    desktop.addEventListener("change", onResize);
    onResize();
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onEscape); desktop.removeEventListener("change", onResize); };
  }, [menuOpen]);
  function submit(event: FormEvent) { event.preventDefault(); close(); router.push(`/catalog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); }
  return <>
    <header className={`shop-header ${pathname === "/constructor" ? "shop-header--constructor" : ""} ${menuOpen ? "shop-header--menu-open" : ""}`}>
      <div className="container shop-header__row">
        <Link href="/" className="shop-brand" onClick={close} aria-label="Big Bubble — главная">big bubble<span>.</span><small>А С Т А Н А</small></Link>
        {pathname === "/constructor" && <><span className="shop-header__constructor-tagline">Больше<br/>чем просто шарики</span><nav className="shop-header__constructor-nav" aria-label="Главная навигация"><Link href="/catalog">Каталог</Link><Link className="active" href="/constructor">Конструктор</Link><Link href="/catalog?category=birthday">Праздники</Link><Link href="/delivery">Доставка</Link><Link href="/contacts">О нас</Link></nav></>}
        <form className="shop-search" role="search" onSubmit={submit}><span aria-hidden="true">⌕</span><input aria-label="Поиск по каталогу" placeholder="Что ищете для праздника?" value={query} onChange={(e) => setQuery(e.target.value)} /><button type="submit">Найти</button></form>
        <div className="shop-header__actions"><Link href="/favorites" className={pathname === "/favorites" ? "active" : ""} aria-label={`Избранное: ${ready ? favorites.length : 0}`}><span className="shop-icon">♡</span><span>Избранное</span>{ready && favorites.length > 0 && <b>{favorites.length}</b>}</Link><Link href="/cart" className={pathname === "/cart" ? "active" : ""} aria-label={`Корзина: ${ready ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0}`}><span className="shop-icon shop-icon--cart"><CartIcon /></span><span>Корзина</span>{ready && cart.length > 0 && <b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b>}</Link></div>
        <button className="shop-menu-button" type="button" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-controls="shop-mobile-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
      </div>
      <div id="shop-mobile-nav" className={`shop-nav-wrap ${menuOpen ? "is-open" : ""}`}><nav className="container shop-nav" aria-label="Навигация"><Link className={pathname === "/catalog" ? "active" : ""} href="/catalog" onClick={close}>Весь каталог</Link>{categories.slice(1).map((category) => <Link key={category.id} href={`/catalog?category=${category.id}`} onClick={close}>{category.label}</Link>)}<Link className={pathname === "/constructor" ? "active" : ""} href="/constructor" onClick={close}>Конструктор</Link><Link href="/delivery" onClick={close}>Доставка и оплата</Link><Link href="/contacts" onClick={close}>Контакты</Link><div className="shop-nav__mobile"><Link href="/favorites" onClick={close}>Избранное</Link><Link href="/cart" onClick={close}>Корзина</Link></div></nav></div>
    </header>
  </>;
}
export function SiteFooter() { return <footer className="shop-footer"><div className="container shop-footer__grid"><div><Link href="/" className="shop-brand shop-brand--light">big bubble<span>.</span><small>А С Т А Н А</small></Link><p>Поводы бывают разными. Красота момента — в деталях.</p></div><nav aria-label="Каталог"><strong>Каталог</strong><Link href="/catalog">Все товары</Link><Link href="/constructor">Конструктор набора</Link>{categories.slice(1).map((category) => <Link key={category.id} href={`/catalog?category=${category.id}`}>{category.label}</Link>)}</nav><nav aria-label="Покупателям"><strong>Покупателям</strong><Link href="/delivery">Доставка и оплата</Link><Link href="/contacts">Контакты</Link><Link href="/favorites">Избранное</Link><Link href="/cart">Корзина</Link></nav></div><div className="container shop-footer__bottom"><span>© Big Bubble Astana</span><span>Цены примерные. Тестовая оплата без списания средств.</span></div></footer>; }
