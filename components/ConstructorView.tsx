"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, type DragEvent, type KeyboardEvent } from "react";
import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/lib/content";
import { defaultSceneText, emptyScene, parseScene, sceneCatalog, sceneCatalogById, sceneCategories, scenePrice, sceneTemplates, type SceneConfig, type SceneElement } from "@/lib/scene";
import { CatalogArtwork, EditorIcon, TemplateArtwork } from "@/components/ConstructorArtwork";

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas"), { ssr: false, loading: () => <div className="scene-canvas scene-canvas--loading">Загружаем сцену…</div> });
const MAX_ELEMENTS = 30;

export default function ConstructorView() {
  const router = useRouter();
  const { addScene } = useShop();
  const [scene, setScene] = useState<SceneConfig>(emptyScene);
  const [draftReady, setDraftReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"catalog" | "templates">("catalog");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("bb-scene-draft") || "null");
      const parsed = parseScene(stored);
      if (parsed) setScene(parsed);
      else if (stored && typeof stored === "object" && "elements" in stored && Array.isArray(stored.elements) && stored.elements.length === 0 && localStorage.getItem("bb-constructor-preview-seen")) setScene(emptyScene);
      else {
        const starter = sceneTemplates[0];
        const elements = starter.elements.map((element) => ({ ...element, id: crypto.randomUUID() }));
        setScene({ version: 1, elements });
        setSelectedId(elements[1]?.id ?? null);
        localStorage.setItem("bb-constructor-preview-seen", "1");
      }
    } catch { /* Damaged local draft is ignored. */ }
    setDraftReady(true);
  }, []);
  useEffect(() => { if (draftReady) localStorage.setItem("bb-scene-draft", JSON.stringify(scene)); }, [scene, draftReady]);

  const selected = scene.elements.find((element) => element.id === selectedId) ?? null;
  const selectedCatalog = selected ? sceneCatalogById.get(selected.catalogId) : null;
  const search = query.trim().toLocaleLowerCase("ru");
  const visibleCatalog = sceneCatalog.filter((item) => (category === "Все" || item.category === category) && `${item.label} ${item.category} ${item.description ?? ""}`.toLocaleLowerCase("ru").includes(search));
  const total = scenePrice(scene);
  const parsed = parseScene(scene);

  function addElement(catalogId: string, x?: number, y?: number) {
    if (!sceneCatalogById.has(catalogId)) return;
    if (scene.elements.length >= MAX_ELEMENTS) { setNotice(`На сцене может быть не больше ${MAX_ELEMENTS} элементов.`); return; }
    const id = crypto.randomUUID();
    const offset = scene.elements.length % 5;
    const element: SceneElement = { id, catalogId, x: x ?? .37 + offset * .065, y: y ?? .38 + offset * .055, scale: 1, rotation: 0, ...(defaultSceneText(catalogId) ? { text: defaultSceneText(catalogId) } : {}) };
    setScene((current) => ({ ...current, elements: [...current.elements, element] }));
    setSelectedId(id);
    setShowOptions(false);
    setNotice("");
  }
  function updateElement(id: string, patch: Partial<SceneElement>) {
    setScene((current) => ({ ...current, elements: current.elements.map((element) => element.id === id ? { ...element, ...patch } : element) }));
  }
  function removeSelected() {
    if (!selected) return;
    setScene((current) => ({ ...current, elements: current.elements.filter((element) => element.id !== selected.id) }));
    setSelectedId(null);
    setShowOptions(false);
  }
  function duplicateSelected() {
    if (!selected) return;
    if (scene.elements.length >= MAX_ELEMENTS) { setNotice(`На сцене может быть не больше ${MAX_ELEMENTS} элементов.`); return; }
    const clone = { ...selected, id: crypto.randomUUID(), x: Math.min(.95, selected.x + .06), y: Math.min(.95, selected.y + .06) };
    setScene((current) => ({ ...current, elements: [...current.elements, clone] }));
    setSelectedId(clone.id);
  }
  function moveLayer(direction: -1 | 1) {
    if (!selected) return;
    setScene((current) => {
      const index = current.elements.findIndex((element) => element.id === selected.id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.elements.length) return current;
      const elements = [...current.elements];
      [elements[index], elements[next]] = [elements[next], elements[index]];
      return { ...current, elements };
    });
  }
  function applyTemplate(templateId: string) {
    const template = sceneTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const elements = template.elements.map((element) => ({ ...element, id: crypto.randomUUID() }));
    setScene({ version: 1, elements });
    setSelectedId(elements[1]?.id ?? null);
    setShowOptions(false);
    setNotice(`Шаблон «${template.title}» загружен. Вы можете менять каждый элемент.`);
  }
  function clearScene() { setScene(emptyScene); setSelectedId(null); setShowOptions(false); setNotice("Сцена очищена."); }
  function saveDraft() { localStorage.setItem("bb-scene-draft", JSON.stringify(scene)); setNotice("Набор сохранён на этом устройстве."); }
  function toCart() {
    if (!parsed) { setNotice(scene.elements.length ? "Проверьте цифру или текст надписи." : "Добавьте хотя бы один элемент."); return; }
    addScene(parsed);
    router.push("/cart");
  }
  function keyboardMove(event: KeyboardEvent<HTMLDivElement>) {
    if (!selected) return;
    const step = event.shiftKey ? .025 : .008;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (delta[event.key]) {
      event.preventDefault();
      updateElement(selected.id, { x: Math.min(.965, Math.max(.035, selected.x + delta[event.key][0])), y: Math.min(.95, Math.max(.05, selected.y + delta[event.key][1])) });
    } else if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); removeSelected(); }
  }
  function startDrag(event: DragEvent<HTMLButtonElement>, catalogId: string) { event.dataTransfer.setData("application/x-bigbubble-element", catalogId); event.dataTransfer.effectAllowed = "copy"; }

  return <main id="main" className="editor-page container">
    <div className="editor-mobile-tabs" role="tablist" aria-label="Панели конструктора">
      <button type="button" role="tab" aria-selected={mobilePanel === "catalog"} onClick={() => setMobilePanel("catalog")}><EditorIcon name="catalog"/>Ассортимент</button>
      <button type="button" role="tab" aria-selected={mobilePanel === "templates"} onClick={() => setMobilePanel("templates")}><EditorIcon name="templates"/>Шаблоны</button>
    </div>
    <div className="editor-layout">
      <aside className={`editor-panel editor-catalog ${mobilePanel === "catalog" ? "editor-panel--mobile-active" : ""}`} aria-label="Каталог элементов">
        <div className="editor-panel__head"><h2>Весь праздничный ассортимент</h2><small>{sceneCatalog.length} товаров и элементов</small></div>
        <div className="editor-search-wrap"><EditorIcon name="search"/><input className="editor-search" aria-label="Поиск элементов" placeholder="Найти шарики, цвета, товары…" value={query} onChange={(event) => setQuery(event.target.value)}/></div>
        <div className="editor-filters" aria-label="Категории">{sceneCategories.map((item) => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="editor-catalog__list">{visibleCatalog.map((item) => <button key={item.id} className="editor-catalog__item" type="button" draggable onDragStart={(event) => startDrag(event, item.id)} onClick={() => addElement(item.id)} title="Нажмите или перетащите на сцену">
          <CatalogArtwork item={item}/><span className="editor-catalog__name"><strong>{item.label}</strong><small>{item.kind === "product" ? item.category : item.description ?? (item.kind === "balloon" ? "Латексный шар" : item.category)}</small></span><span className="editor-catalog__price">{formatPrice(item.price)}</span><span className="editor-catalog__add"><EditorIcon name="plus"/></span>
        </button>)}{!visibleCatalog.length && <p className="editor-muted">Ничего не найдено. Попробуйте другой запрос.</p>}</div>
        <p className="editor-panel__hint">Нажмите на товар или перетащите его на сцену.</p>
      </aside>

      <section className="editor-workspace" aria-label="Сцена конструктора">
        <div className="editor-workspace__toolbar"><div><h1>Конструктор набора</h1><span>{scene.elements.length} из {MAX_ELEMENTS} элементов</span></div><div className="editor-workspace__toolbar-actions"><button type="button" onClick={saveDraft}><EditorIcon name="save"/>Сохранить набор</button><button type="button" onClick={clearScene} disabled={!scene.elements.length}><EditorIcon name="clear"/><span className="editor-clear-label">Очистить</span></button></div></div>
        <div className="editor-stage" tabIndex={0} onKeyDown={keyboardMove} aria-label="Сцена. Выбранный элемент можно двигать стрелками, удалить клавишей Delete."><SceneCanvas scene={scene} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setShowOptions(false); }} onChange={updateElement} onDropCatalog={addElement}/></div>
        <div className="editor-controlbar" aria-label="Управление выбранным элементом">
          {selected && selectedCatalog ? <>
            <div className="editor-controlbar__item"><CatalogArtwork item={selectedCatalog}/><span><strong>{selectedCatalog.label}</strong><small>Выбранный элемент</small></span></div>
            <label className="editor-controlbar__range">Размер <input aria-label="Размер выбранного элемента" type="range" min="0.55" max="1.85" step="0.05" value={selected.scale} onChange={(event) => updateElement(selected.id, { scale: Number(event.target.value) })}/><output>{Math.round(selected.scale * 100)}%</output></label>
            <label className="editor-controlbar__range editor-controlbar__range--rotate">Поворот <EditorIcon name="rotate"/><input aria-label="Поворот выбранного элемента" type="range" min="-180" max="180" step="5" value={selected.rotation} onChange={(event) => updateElement(selected.id, { rotation: Number(event.target.value) })}/><output>{Math.round(selected.rotation)}°</output></label>
            <div className="editor-controlbar__buttons"><button type="button" onClick={duplicateSelected} aria-label="Дублировать элемент" title="Дублировать"><EditorIcon name="copy"/></button><button type="button" className="editor-controlbar__delete" onClick={removeSelected} aria-label="Удалить элемент" title="Удалить"><EditorIcon name="trash"/></button><button type="button" onClick={() => setShowOptions((value) => !value)} aria-label="Дополнительные настройки" aria-expanded={showOptions} title="Дополнительные настройки"><EditorIcon name="more"/></button></div>
          </> : <div className="editor-controlbar__placeholder">Выберите объект на сцене, чтобы изменить его размер и положение.</div>}
        </div>
        {selected && selectedCatalog && showOptions && <div className="editor-selection" aria-label="Дополнительные настройки элемента">
          {(selectedCatalog.kind === "number" || selectedCatalog.kind === "inscription") && <label>{selectedCatalog.kind === "number" ? "Цифра (0–99)" : "Текст надписи"}<input value={selected.text || ""} maxLength={selectedCatalog.kind === "number" ? 2 : 40} inputMode={selectedCatalog.kind === "number" ? "numeric" : "text"} onChange={(event) => updateElement(selected.id, { text: selectedCatalog.kind === "number" ? event.target.value.replace(/\D/g, "") : event.target.value })}/></label>}
          {selectedCatalog.kind === "product" && <p className="editor-selection__product">{selectedCatalog.description} {selectedCatalog.productId && <Link href={`/catalog/${selectedCatalog.productId}`}>Подробнее о товаре</Link>}</p>}
          <div className="editor-selection__actions"><button type="button" onClick={() => moveLayer(-1)}><EditorIcon name="back"/>Назад</button><button type="button" onClick={() => moveLayer(1)}><EditorIcon name="front"/>Вперёд</button><button type="button" onClick={() => setSelectedId(null)}><EditorIcon name="close"/>Снять выделение</button></div>
        </div>}
      </section>

      <aside className={`editor-panel editor-templates ${mobilePanel === "templates" ? "editor-panel--mobile-active" : ""}`} aria-label="Готовые шаблоны">
        <div className="editor-panel__head editor-panel__head--templates"><h2>Готовые шаблоны</h2><button type="button" onClick={() => { setMobilePanel("templates"); document.querySelector(".editor-templates__list")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}>Смотреть все <EditorIcon name="arrow"/></button></div>
        <div className="editor-templates__list">{sceneTemplates.map((template) => { const price = scenePrice({ version: 1, elements: template.elements.map((element, index) => ({ ...element, id: String(index) })) }); return <button type="button" className="editor-template" key={template.id} onClick={() => applyTemplate(template.id)}>
          <TemplateArtwork template={template}/><span className="editor-template__body"><strong>{template.title}</strong><small>{template.description}</small><b>{formatPrice(price)}</b><span>Использовать</span></span>
        </button>; })}</div>
        <p className="editor-panel__hint">Любой шаблон можно изменить под ваш праздник.</p>
      </aside>
    </div>
    <div className="editor-checkout"><div className="editor-checkout__items"><strong>Ваш набор</strong><div className="editor-checkout__thumbs">{scene.elements.slice(0, 7).map((element) => { const item = sceneCatalogById.get(element.catalogId); return item ? <span key={element.id} title={item.label}><CatalogArtwork item={item}/></span> : null; })}{scene.elements.length > 7 && <span className="editor-checkout__more">+{scene.elements.length - 7}</span>}{!scene.elements.length && <small>Пока пусто</small>}</div></div><div className="editor-checkout__total"><small>Итого</small><strong>{formatPrice(total)}</strong></div><button type="button" className="shop-button" onClick={toCart} disabled={!draftReady || !parsed}><EditorIcon name="basket"/>Добавить в корзину</button></div>
    {notice && <p className="editor-notice" role="status">{notice}</p>}
    <p className="editor-disclaimer">Предпросмотр показывает состав набора. Реальная форма и расположение элементов могут отличаться. Цены примерные; оплата сейчас демонстрационная.</p>
  </main>;
}
