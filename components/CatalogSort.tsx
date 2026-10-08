"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const options = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "name", label: "По названию" },
] as const;

export default function CatalogSort({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

  useEffect(() => {
    if (!open) return;
    optionRefs.current[selectedIndex]?.focus();
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open, selectedIndex]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); }
      return;
    }
    const focusedIndex = optionRefs.current.findIndex((item) => item === document.activeElement);
    let nextIndex = focusedIndex;
    if (event.key === "ArrowDown") nextIndex = (focusedIndex + 1) % options.length;
    else if (event.key === "ArrowUp") nextIndex = (focusedIndex - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    } else return;
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  }

  return <div className="catalog-sort" ref={rootRef} onKeyDown={moveFocus} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <span className="catalog-sort__label">Сортировка</span>
    <div className="catalog-sort__control">
      <button ref={triggerRef} className={`catalog-sort__trigger ${open ? "is-open" : ""}`} type="button" aria-label={`Сортировка: ${options[selectedIndex].label}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => setOpen((current) => !current)}>
        <span>{options[selectedIndex].label}</span>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && <div id={menuId} className="catalog-sort__menu" role="menu" aria-label="Порядок товаров">
        <span className="catalog-sort__menu-title">Порядок товаров</span>
        {options.map((option, index) => <button key={option.value} ref={(element) => { optionRefs.current[index] = element; }} type="button" className={`catalog-sort__option ${selectedIndex === index ? "is-selected" : ""}`} role="menuitemradio" aria-checked={selectedIndex === index} onClick={() => { setOpen(false); onChange(option.value); triggerRef.current?.focus(); }}>
          <span className="catalog-sort__option-number">0{index + 1}</span><span>{option.label}</span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4.5 10 3.5 3.5 7.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>)}
      </div>}
    </div>
  </div>;
}
