"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, type DragEvent } from "react";
import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/lib/content";
import { serviceFee } from "@/lib/cart";
import { archBalloons, archHeights, archPatterns, archPrice, balloonMaterials, balloonSizes, emptyArch, isArchBalloon, isReadyExtra, parseArch, parseReady, readyPrice, type ArchConfig, type ArchHeight, type ArchOverride, type ArchPattern, type BalloonMaterial, type BalloonSize, type ReadyConfig } from "@/lib/arch";
import { defaultSceneText, sceneCatalog, sceneCatalogById, sceneTemplates, type SceneConfig, type SceneElement } from "@/lib/scene";
import { CatalogArtwork, EditorIcon, TemplateArtwork } from "@/components/ConstructorArtwork";
import ArchCanvas from "@/components/ArchCanvas";
import ArchPatternArtwork from "@/components/ArchPatternArtwork";

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas"), { ssr: false, loading: () => <div className="scene-canvas scene-canvas--loading">Загружаем композицию…</div> });
type Mode = "ready" | "arch";
const blankReady = (): ReadyConfig => ({ version: 1, templateId: sceneTemplates[0].id, extras: [] });

export default function ConstructorView() {
  const router = useRouter();
  const { addArch, addReady } = useShop();
  const [mode, setMode] = useState<Mode>("ready");
  const [ready, setReady] = useState<ReadyConfig>(blankReady);
  const [arch, setArch] = useState<ArchConfig>(emptyArch);
  const [hydrated, setHydrated] = useState(false);
  const [rightTab, setRightTab] = useState<Mode>("ready");
  const [mobilePanel, setMobilePanel] = useState<"catalog" | "templates">("catalog");
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedExtraId, setSelectedExtraId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("bb-constructor-v2") || "null") as { mode?: Mode; ready?: unknown; arch?: unknown } | null;
      const savedReady = parseReady(stored?.ready);
      const savedArch = parseArch(stored?.arch);
      if (savedReady) setReady(savedReady);
      if (savedArch) setArch(savedArch);
      if (stored?.mode === "ready" || stored?.mode === "arch") { setMode(stored.mode); setRightTab(stored.mode); }
    } catch { /* A damaged local draft is ignored. */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("bb-constructor-v2", JSON.stringify({ mode, ready, arch })); }, [mode, ready, arch, hydrated]);

  const template = sceneTemplates.find((item) => item.id === ready.templateId)!;
  const baseElements: SceneElement[] = template.elements.map((element, index) => ({ ...element, id: `template-base-${index}` }));
  const readyScene: SceneConfig = { version: 1, elements: [...baseElements, ...ready.extras] };
  const balloons = archBalloons(arch);
  const filled = balloons.filter((item) => item.catalogId);
  const selectedBalloon = selectedIndex === null ? null : balloons[selectedIndex] ?? null;
  const activeExtras = mode === "ready" ? ready.extras : arch.extras;
  const selectedExtra = activeExtras.find((item) => item.id === selectedExtraId) ?? null;
  const selectedExtraCatalog = selectedExtra ? sceneCatalogById.get(selectedExtra.catalogId) : null;
  const subtotal = mode === "ready" ? readyPrice(ready) : archPrice(arch);
  const fee = serviceFee(subtotal);
  const catalogSource = sceneCatalog.filter((item) => mode === "arch" ? item.id !== "balloon-arch" : isReadyExtra(item.id));
  const categories = ["Все", ...new Set(catalogSource.map((item) => item.category))];
  const term = query.trim().toLocaleLowerCase("ru");
  const visibleCatalog = catalogSource.filter((item) => (category === "Все" || category === item.category) && `${item.label} ${item.category} ${item.description ?? ""}`.toLocaleLowerCase("ru").includes(term));

  function switchMode(next: Mode) {
    setMode(next); setRightTab(next); setCategory("Все"); setSelectedExtraId(null); setSelectedIndex(null); setNotice("");
  }
  function addExtra(catalogId: string, x?: number, y?: number) {
    if (mode === "ready" && !isReadyExtra(catalogId)) { setNotice("К готовому шаблону можно добавить подарки и фольгированные фигуры."); return; }
    if (mode === "arch" && (!sceneCatalogById.has(catalogId) || catalogId === "balloon-arch")) return;
    if (activeExtras.length >= 12) { setNotice("Рядом с композицией можно разместить до 12 дополнений."); return; }
    const id = crypto.randomUUID();
    const element: SceneElement = { id, catalogId, x: x ?? .68, y: y ?? .69, scale: 1, rotation: 0, ...(defaultSceneText(catalogId) ? { text: defaultSceneText(catalogId) } : {}) };
    if (mode === "ready") setReady((current) => ({ ...current, extras: [...current.extras, element] }));
    else setArch((current) => ({ ...current, extras: [...current.extras, element] }));
    setSelectedExtraId(id); setSelectedIndex(null); setNotice("");
  }
  function updateExtra(id: string, patch: Partial<SceneElement>) {
    if (mode === "ready") setReady((current) => ({ ...current, extras: current.extras.map((item) => item.id === id ? { ...item, ...patch } : item) }));
    else setArch((current) => ({ ...current, extras: current.extras.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  }
  function removeExtra() {
    if (!selectedExtraId) return;
    if (mode === "ready") setReady((current) => ({ ...current, extras: current.extras.filter((item) => item.id !== selectedExtraId) }));
    else setArch((current) => ({ ...current, extras: current.extras.filter((item) => item.id !== selectedExtraId) }));
    setSelectedExtraId(null);
  }
  function setSlot(index: number, catalogId: string | null) {
    if (catalogId && !isArchBalloon(catalogId)) { setNotice("В слот арки можно поставить только шар."); return; }
    setArch((current) => ({ ...current, slots: current.slots.map((item, at) => at === index ? catalogId : item), overrides: catalogId ? current.overrides : current.overrides.filter((item) => balloons[item.index]?.slot !== index) }));
    setSelectedSlot(index); setSelectedIndex(null); setNotice(catalogId ? "Шары расставлены по выбранной схеме." : "Слот очищен — в арке появились пробелы.");
  }
  function changePattern(pattern: ArchPattern) {
    const spec = archPatterns.find((item) => item.id === pattern)!;
    setArch((current) => ({ ...current, pattern, slots: Array.from({ length: spec.defaultSlots }, (_, index) => current.slots[index] ?? null) }));
    setMode("arch"); setRightTab("arch"); setSelectedSlot(0); setSelectedIndex(null); setSelectedExtraId(null); setNotice(`Схема «${spec.label}» применена. Индивидуальные параметры шаров сохранены.`);
  }
  function changeSlotCount(delta: number) {
    if (arch.pattern === "cross") return;
    const count = Math.max(2, Math.min(6, arch.slots.length + delta));
    setArch((current) => ({ ...current, slots: Array.from({ length: count }, (_, index) => current.slots[index] ?? null) }));
    setSelectedSlot((value) => Math.min(value, count - 1)); setSelectedIndex(null);
  }
  function changeHeight(height: ArchHeight) {
    const count = archHeights.find((item) => item.value === height)!.columns * 3;
    setArch((current) => ({ ...current, height, overrides: current.overrides.filter((item) => item.index < count) }));
    setSelectedIndex(null);
  }
  function updateBalloon(index: number, patch: Partial<ArchOverride>) {
    setArch((current) => {
      const previous = current.overrides.find((item) => item.index === index) ?? { index };
      return { ...current, overrides: [...current.overrides.filter((item) => item.index !== index), { ...previous, ...patch }] };
    });
  }
  function changeBalloonSize(index: number, size: BalloonSize) {
    const selected = balloons[index];
    if (!selected?.catalogId) return;
    if (size === "large" && balloons.some((other) => other.index !== index && other.catalogId && other.size === "large" && Math.abs(other.column - selected.column) <= 1 && Math.abs(other.row - selected.row) <= 1)) {
      setNotice("Рядом уже есть крупный шар. Уменьшите его, чтобы освободить место."); return;
    }
    updateBalloon(index, { size }); setNotice("");
  }
  function moveBalloon(from: number, to: number) {
    const a = balloons[from], b = balloons[to];
    if (!a?.catalogId || !b?.catalogId) return;
    setArch((current) => ({ ...current, overrides: [...current.overrides.filter((item) => item.index !== from && item.index !== to), { index: from, catalogId: b.catalogId!, size: b.size, material: b.material }, { index: to, catalogId: a.catalogId!, size: a.size, material: a.material }] }));
    setSelectedIndex(to); setNotice("Шары поменялись местами.");
  }
  function moveSelectedBalloon(direction: -1 | 1) {
    if (selectedIndex === null) return;
    const next = direction < 0
      ? [...filled].reverse().find((item) => item.index < selectedIndex)
      : filled.find((item) => item.index > selectedIndex);
    if (next) moveBalloon(selectedIndex, next.index);
  }
  function selectTemplate(id: string) {
    if (!sceneTemplates.some((item) => item.id === id)) return;
    setReady({ version: 1, templateId: id, extras: [] }); switchMode("ready"); setNotice("Готовая композиция выбрана. Можно добавить подарок или фольгированную фигуру рядом.");
  }
  function addFromCatalog(id: string, x?: number, y?: number) {
    if (mode === "arch" && isArchBalloon(id)) setSlot(selectedSlot, id);
    else addExtra(id, x, y);
  }
  function startDrag(event: DragEvent<HTMLDivElement>, id: string) { event.dataTransfer.setData("application/x-bigbubble-element", id); event.dataTransfer.effectAllowed = "copy"; }
  function dropSlot(event: DragEvent<HTMLButtonElement>, index: number) {
    event.preventDefault(); event.stopPropagation();
    const id = event.dataTransfer.getData("application/x-bigbubble-element");
    setSlot(index, id);
  }
  function clearCurrent() {
    if (mode === "ready") setReady((current) => ({ ...current, extras: [] }));
    else setArch((current) => ({ ...current, slots: current.slots.map(() => null), overrides: [], extras: [] }));
    setSelectedExtraId(null); setSelectedIndex(null); setNotice(mode === "ready" ? "Дополнения убраны. Готовый шаблон сохранён." : "Арка очищена.");
  }
  function saveDraft() { localStorage.setItem("bb-constructor-v2", JSON.stringify({ mode, ready, arch })); setNotice("Черновик сохранён на этом устройстве."); }
  function toCart() {
    if (mode === "ready") { const config = parseReady(ready); if (!config) { setNotice("Проверьте дополнения к шаблону."); return; } addReady(config); }
    else { const config = parseArch(arch); if (!config) { setNotice("Проверьте параметры арки."); return; } addArch(config); }
    router.push("/cart");
  }

  return <main id="main" className="editor-page container editor-page--v2">
    <div className="editor-mobile-tabs" role="tablist" aria-label="Панели конструктора">
      <button type="button" role="tab" aria-selected={mobilePanel === "catalog"} onClick={() => setMobilePanel("catalog")}><EditorIcon name="catalog"/>Ассортимент</button>
      <button type="button" role="tab" aria-selected={mobilePanel === "templates"} onClick={() => setMobilePanel("templates")}><EditorIcon name="templates"/>Шаблоны и схемы</button>
    </div>
    <div className="editor-layout">
      <aside className={`editor-panel editor-catalog ${mobilePanel === "catalog" ? "editor-panel--mobile-active" : ""}`} aria-label="Каталог элементов">
        <div className="editor-panel__head"><h2>{mode === "arch" ? "Шары и дополнения" : "Дополнить композицию"}</h2><small>{mode === "arch" ? "Шары — в слоты, остальные товары — рядом" : "Подарки и фольгированные фигуры"}</small></div>
        <div className="editor-search-wrap"><EditorIcon name="search"/><input className="editor-search" aria-label="Поиск элементов" placeholder="Найти шар или подарок…" value={query} onChange={(event) => setQuery(event.target.value)}/></div>
        <div className="editor-filters" aria-label="Категории">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="editor-catalog__list">{visibleCatalog.map((item) => <div key={item.id} className="editor-catalog__item editor-catalog__item--v2" draggable onDragStart={(event) => startDrag(event, item.id)}>
          <button className="editor-catalog__main" type="button" onClick={() => addFromCatalog(item.id)} title={mode === "arch" && isArchBalloon(item.id) ? `Добавить в слот ${selectedSlot + 1}` : "Добавить на сцену"}><CatalogArtwork item={item}/><span className="editor-catalog__name"><strong>{item.label}</strong><small>{isArchBalloon(item.id) ? "Шар для арки" : item.category}</small></span><span className="editor-catalog__price">{formatPrice(item.price)}</span><span className="editor-catalog__add"><EditorIcon name="plus"/></span></button>
          {mode === "arch" && isArchBalloon(item.id) && <button type="button" className="editor-catalog__loose" onClick={() => addExtra(item.id)}>Поставить рядом</button>}
        </div>)}{!visibleCatalog.length && <p className="editor-muted">Ничего не найдено. Попробуйте другой запрос.</p>}</div>
        <p className="editor-panel__hint">{mode === "arch" ? `Выбран слот ${selectedSlot + 1}. Нажмите на шар или перетащите его в круглый слот.` : "Готовый шаблон остаётся неизменным. Дополнения можно перемещать на сцене."}</p>
      </aside>

      <section className="editor-workspace" aria-label="Сцена конструктора">
        <div className="editor-workspace__toolbar"><div><h1>{mode === "arch" ? "Своя арка" : "Готовая композиция"}</h1><span>{mode === "arch" ? `${filled.length} из ${balloons.length} шаров · высота ${arch.height} м` : template.title}</span></div><div className="editor-workspace__toolbar-actions"><button type="button" onClick={saveDraft}><EditorIcon name="save"/>Сохранить</button><button type="button" onClick={clearCurrent}><EditorIcon name="clear"/><span className="editor-clear-label">Очистить</span></button></div></div>
        {mode === "arch" && <div className="arch-sizebar"><span>Высота арки</span><div role="group" aria-label="Высота арки">{archHeights.map((item) => <button type="button" key={item.value} className={arch.height === item.value ? "is-active" : ""} aria-pressed={arch.height === item.value} onClick={() => changeHeight(item.value)}>{item.label}</button>)}</div><small>Каркас: {formatPrice(archHeights.find((item) => item.value === arch.height)!.framePrice)}</small></div>}
        {mode === "ready" ? <div className="editor-stage"><SceneCanvas scene={readyScene} lockedIds={baseElements.map((item) => item.id)} selectedId={selectedExtraId} onSelect={(id) => { setSelectedExtraId(id); setSelectedIndex(null); }} onChange={updateExtra} onDropCatalog={addFromCatalog}/></div> : <div className="arch-stage">
          <div className="arch-slotrail" aria-label="Слоты цветов арки"><strong>Слоты арки</strong><small>Поставьте шар в каждый нужный слот</small><div className="arch-slotrail__list">{arch.slots.map((id, index) => { const item = id ? sceneCatalogById.get(id) : null; return <div className={`arch-slotrail__row ${selectedSlot === index ? "is-active" : ""}`} key={index}><button type="button" className="arch-slot" aria-label={`Слот ${index + 1}${item ? `: ${item.label}` : ": пустой"}`} aria-pressed={selectedSlot === index} onClick={() => { setSelectedSlot(index); setSelectedIndex(null); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropSlot(event, index)}><span className="arch-slot__circle" style={item ? { background: item.color } : undefined}>{item ? "" : "+"}</span><span><b>{arch.pattern === "cross" ? index === 0 ? "Рисунок X" : "Фон арки" : `Цвет ${index + 1}`}</b><small>{item?.label ?? "Пустой слот"}</small></span></button>{item && <button type="button" className="arch-slot__remove" aria-label={`Очистить слот ${index + 1}`} onClick={() => setSlot(index, null)}>×</button>}</div>; })}</div>{arch.pattern !== "cross" && <div className="arch-slotrail__count"><button type="button" onClick={() => changeSlotCount(-1)} disabled={arch.slots.length <= 2} aria-label="Уменьшить число слотов">−</button><span>{arch.slots.length} цвета</span><button type="button" onClick={() => changeSlotCount(1)} disabled={arch.slots.length >= 6} aria-label="Увеличить число слотов">+</button></div>}</div>
          <ArchCanvas config={arch} selectedIndex={selectedIndex} selectedExtraId={selectedExtraId} onSelectIndex={(index) => { setSelectedIndex(index); setSelectedExtraId(null); }} onSelectExtra={(id) => { setSelectedExtraId(id); setSelectedIndex(null); }} onMoveBalloon={moveBalloon} onChangeExtra={updateExtra} onDropCatalog={addFromCatalog}/>
        </div>}
        {mode === "arch" && selectedBalloon?.catalogId ? <div className="arch-balloon-editor"><div className="arch-balloon-editor__title"><strong>Шар №{selectedBalloon.index + 1}</strong><small>Индивидуальные параметры · итоговый размер {Math.round(23 * selectedBalloon.effectiveFactor)} см</small></div><label>Цвет<select aria-label="Цвет выбранного шара" value={selectedBalloon.catalogId} onChange={(event) => updateBalloon(selectedBalloon.index, { catalogId: event.target.value })}>{sceneCatalog.filter((item) => isArchBalloon(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Размер<select aria-label="Размер выбранного шара" value={selectedBalloon.size} onChange={(event) => changeBalloonSize(selectedBalloon.index, event.target.value as BalloonSize)}>{balloonSizes.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.cm} см</option>)}</select></label><label>Материал<select aria-label="Материал выбранного шара" value={selectedBalloon.material} onChange={(event) => updateBalloon(selectedBalloon.index, { material: event.target.value as BalloonMaterial })}>{balloonMaterials.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><button type="button" disabled={!filled.some((item) => item.index < selectedBalloon.index)} onClick={() => moveSelectedBalloon(-1)}>← Предыдущий</button><button type="button" disabled={!filled.some((item) => item.index > selectedBalloon.index)} onClick={() => moveSelectedBalloon(1)}>Следующий →</button><button type="button" onClick={() => setArch((current) => ({ ...current, overrides: current.overrides.filter((item) => item.index !== selectedBalloon.index) }))}>Сбросить изменения</button><small className="arch-balloon-editor__hint">Измените позицию кнопками или перетащите шар на другой шар.</small></div> : selectedExtra && selectedExtraCatalog ? <div className="arch-extra-editor"><CatalogArtwork item={selectedExtraCatalog}/><strong>{selectedExtraCatalog.label}</strong><label>Размер <input aria-label="Размер дополнения" type="range" min="0.55" max="1.85" step="0.05" value={selectedExtra.scale} onChange={(event) => updateExtra(selectedExtra.id, { scale: Number(event.target.value) })}/></label><button type="button" onClick={removeExtra}><EditorIcon name="trash"/> Удалить</button></div> : <div className="arch-editor-placeholder">{mode === "arch" ? "Нажмите на шар в арке, чтобы изменить его отдельно." : "Готовый шаблон не меняется. Выберите дополнение на сцене, чтобы изменить его."}</div>}
      </section>

      <aside className={`editor-panel editor-templates ${mobilePanel === "templates" ? "editor-panel--mobile-active" : ""}`} aria-label="Шаблоны и схемы">
        <div className="arch-right-tabs" role="tablist" aria-label="Режим конструктора"><button type="button" role="tab" aria-selected={rightTab === "ready"} className={rightTab === "ready" ? "is-active" : ""} onClick={() => switchMode("ready")}>Готовые шаблоны</button><button type="button" role="tab" aria-selected={rightTab === "arch"} className={rightTab === "arch" ? "is-active" : ""} onClick={() => switchMode("arch")}>Схемы арки</button></div>
        {rightTab === "ready" ? <><div className="editor-panel__head"><h2>Готовые шаблоны</h2><small>Композиции сохраняют свой исходный вид</small></div><div className="editor-templates__list">{sceneTemplates.map((item) => <button type="button" className={`editor-template ${mode === "ready" && ready.templateId === item.id ? "is-active" : ""}`} key={item.id} onClick={() => selectTemplate(item.id)}><TemplateArtwork template={item}/><span className="editor-template__body"><strong>{item.title}</strong><small>{item.description}</small><b>{formatPrice(readyPrice({ version: 1, templateId: item.id, extras: [] }))}</b><span>{mode === "ready" && ready.templateId === item.id ? "Выбран" : "Выбрать"}</span></span></button>)}</div><p className="editor-panel__hint">К шаблону можно добавить только подарок или фольгированную фигуру.</p></> : <><div className="editor-panel__head"><h2>Схемы расстановки</h2><small>Схема задаёт порядок шаров и число слотов</small></div><div className="arch-patterns">{archPatterns.map((item) => <button type="button" key={item.id} className={`arch-pattern ${arch.pattern === item.id ? "is-active" : ""}`} aria-pressed={arch.pattern === item.id} onClick={() => changePattern(item.id)}><ArchPatternArtwork pattern={item.id}/><span className="arch-pattern__body"><strong>{item.label}</strong><small>{item.detail}</small><em className="arch-pattern__meta">{item.id === "cross" ? "2 слота" : "2–6 слотов"}</em></span><span className="arch-pattern__action" aria-hidden="true">{arch.pattern === item.id ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4.5 4.5L19 7"/></svg> : <EditorIcon name="arrow"/>}</span></button>)}</div><p className="editor-panel__hint">X-рисунок использует два слота. В остальных схемах можно выбрать от двух до шести цветов.</p></>}
      </aside>
    </div>
    <div className="editor-checkout"><div className="editor-checkout__items"><strong>{mode === "arch" ? "Своя арка" : template.title}</strong><small>{mode === "arch" ? `${filled.length} шаров · высота ${arch.height} м` : `Готовый шаблон · ${ready.extras.length} дополнений`}</small></div><div className="editor-checkout__total"><small>Товары {formatPrice(subtotal)} + работа 10%</small><strong>{formatPrice(subtotal + fee)}</strong></div><button type="button" className="shop-button" onClick={toCart} disabled={!hydrated}><EditorIcon name="basket"/>Добавить в корзину</button></div>
    {notice && <p className="editor-notice" role="status">{notice}</p>}
    <p className="editor-disclaimer">Вместимость и цены арок пока примерные. Доставка включена в стоимость работы. Реальная оплата зависит от подключённого платёжного режима.</p>
  </main>;
}
