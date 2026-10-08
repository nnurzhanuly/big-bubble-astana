"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, type DragEvent, type KeyboardEvent } from "react";
import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/lib/content";
import { defaultSceneText, emptyScene, parseScene, sceneCatalog, sceneCatalogById, sceneCategories, sceneDescription, scenePrice, sceneTemplates, type SceneConfig, type SceneElement } from "@/lib/scene";
import { CatalogArtwork, EditorIcon, TemplateArtwork } from "@/components/ConstructorArtwork";

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas"), { ssr: false, loading: () => <div className="scene-canvas scene-canvas--loading">Загружаем сцену…</div> });
const MAX_ELEMENTS = 30;

export default function ConstructorView() {
  const router = useRouter();
  const { addScene } = useShop();
  const [scene, setScene] = useState<SceneConfig>(emptyScene);
  const [draftReady, setDraftReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"catalog" | "templates">("catalog");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("bb-scene-draft") || "null");
      if (stored && typeof stored === "object" && "elements" in stored && Array.isArray(stored.elements) && stored.elements.length === 0) setScene(emptyScene);
      else { const parsed = parseScene(stored); if (parsed) setScene(parsed); }
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
    setNotice("");
  }
  function updateElement(id: string, patch: Partial<SceneElement>) {
    setScene((current) => ({ ...current, elements: current.elements.map((element) => element.id === id ? { ...element, ...patch } : element) }));
  }
  function removeSelected() {
    if (!selected) return;
    setScene((current) => ({ ...current, elements: current.elements.filter((element) => element.id !== selected.id) }));
    setSelectedId(null);
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
    setScene({ version: 1, elements: template.elements.map((element) => ({ ...element, id: crypto.randomUUID() })) });
    setSelectedId(null);
    setNotice(`Шаблон «${template.title}» загружен. Вы можете менять каждый элемент.`);
  }
  function clearScene() { setScene(emptyScene); setSelectedId(null); setNotice("Сцена очищена."); }
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
    <nav className="breadcrumbs"><Link href="/">Главная</Link><span>/</span>Конструктор</nav>
    <header className="editor-heading"><div><span className="shop-eyebrow">Ваш праздник, ваши правила</span><h1>Конструктор набора<span className="heading-dot">.</span></h1><p>Соберите набор из отдельных элементов и всех товаров каталога — в том числе арок и оформления.</p></div><div className="editor-heading__note">Цены примерные · оформление заказа на сайте</div></header>
    <div className="editor-mobile-tabs" role="tablist" aria-label="Панели конструктора"><button type="button" role="tab" aria-selected={mobilePanel === "catalog"} onClick={() => setMobilePanel("catalog")}><EditorIcon name="catalog"/>Элементы</button><button type="button" role="tab" aria-selected={mobilePanel === "templates"} onClick={() => setMobilePanel("templates")}><EditorIcon name="templates"/>Шаблоны</button></div>
    <div className="editor-layout">
      <aside className={`editor-panel editor-catalog ${mobilePanel === "catalog" ? "editor-panel--mobile-active" : ""}`} aria-label="Каталог элементов">
        <div className="editor-panel__head"><span>01 / Весь ассортимент</span><h2>Добавить на сцену</h2><small>{sceneCatalog.length} позиций · элементы и готовые товары</small></div>
        <div className="editor-search-wrap"><EditorIcon name="search"/><input className="editor-search" aria-label="Поиск элементов" placeholder="Поиск элементов" value={query} onChange={(event) => setQuery(event.target.value)}/></div>
        <div className="editor-filters" aria-label="Категории">{sceneCategories.map((item) => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="editor-catalog__list">{visibleCatalog.map((item) => <button key={item.id} className="editor-catalog__item" type="button" draggable onDragStart={(event) => startDrag(event, item.id)} onClick={() => addElement(item.id)} title="Нажмите или перетащите на сцену"><CatalogArtwork item={item}/><span className="editor-catalog__name"><strong>{item.label}</strong><small>{item.kind === "product" ? "Готовый товар · " : ""}{formatPrice(item.price)}</small></span><span className="editor-catalog__add"><EditorIcon name="plus"/></span></button>)}{!visibleCatalog.length && <p className="editor-muted">Ничего не найдено.</p>}</div>
        <p className="editor-panel__hint">На компьютере перетаскивайте элементы. На телефоне нажмите на элемент, затем передвиньте его на сцене.</p>
      </aside>

      <section className="editor-workspace" aria-label="Сцена конструктора"><div className="editor-workspace__toolbar"><div><span>02 / Ваша сцена</span><strong>{scene.elements.length} из {MAX_ELEMENTS} элементов</strong></div><button type="button" onClick={clearScene} disabled={!scene.elements.length}><EditorIcon name="clear"/>Очистить сцену</button></div>
        <div className="editor-stage" tabIndex={0} onKeyDown={keyboardMove} aria-label="Сцена. Выбранный элемент можно двигать стрелками, удалить клавишей Delete."><SceneCanvas scene={scene} selectedId={selectedId} onSelect={setSelectedId} onChange={updateElement} onDropCatalog={addElement}/></div>
        <div className="editor-workspace__below"><span>Выберите объект, чтобы изменить размер, поворот и порядок.</span><span>Предпросмотр композиции</span></div>
        {selected && selectedCatalog && <div className="editor-selection" aria-label="Настройки выбранного элемента"><div className="editor-selection__head"><div><small>{selectedCatalog.kind === "product" ? "Готовый товар" : "Выбранный элемент"}</small><h3>{selectedCatalog.label}</h3></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Снять выделение"><EditorIcon name="close"/></button></div>
          {selectedCatalog.kind === "product" && <p className="editor-selection__product">{selectedCatalog.description} {selectedCatalog.productId && <Link href={`/catalog/${selectedCatalog.productId}`}>Подробнее о товаре ↗</Link>}</p>}
          {(selectedCatalog.kind === "number" || selectedCatalog.kind === "inscription") && <label>{selectedCatalog.kind === "number" ? "Цифра (0–99)" : "Текст надписи"}<input value={selected.text || ""} maxLength={selectedCatalog.kind === "number" ? 2 : 40} inputMode={selectedCatalog.kind === "number" ? "numeric" : "text"} onChange={(event) => updateElement(selected.id, { text: selectedCatalog.kind === "number" ? event.target.value.replace(/\D/g, "") : event.target.value })}/></label>}
          <div className="editor-selection__sliders"><label>Размер <input type="range" min="0.55" max="1.85" step="0.05" value={selected.scale} onChange={(event) => updateElement(selected.id, { scale: Number(event.target.value) })}/><output>{Math.round(selected.scale * 100)}%</output></label><label>Поворот <input type="range" min="-180" max="180" step="5" value={selected.rotation} onChange={(event) => updateElement(selected.id, { rotation: Number(event.target.value) })}/><output>{Math.round(selected.rotation)}°</output></label></div>
          <div className="editor-selection__actions"><button type="button" onClick={() => moveLayer(-1)}><EditorIcon name="back"/>На задний план</button><button type="button" onClick={() => moveLayer(1)}><EditorIcon name="front"/>На передний план</button><button type="button" onClick={duplicateSelected}><EditorIcon name="copy"/>Дублировать</button><button type="button" className="editor-selection__delete" onClick={removeSelected}><EditorIcon name="trash"/>Удалить</button></div>
        </div>}
      </section>

      <aside className={`editor-panel editor-templates ${mobilePanel === "templates" ? "editor-panel--mobile-active" : ""}`} aria-label="Готовые шаблоны"><div className="editor-panel__head"><span>03 / Быстрый старт</span><h2>Готовые шаблоны</h2></div><p className="editor-panel__hint">Шаблон заполнит сцену. После этого всё можно изменить.</p><div className="editor-templates__list">{sceneTemplates.map((template) => { const price = scenePrice({ version: 1, elements: template.elements.map((element, index) => ({ ...element, id: String(index) })) }); return <button type="button" className="editor-template" key={template.id} onClick={() => applyTemplate(template.id)}><TemplateArtwork template={template}/><strong>{template.title}</strong><small>{template.description}</small><span>от {formatPrice(price)} <EditorIcon name="arrow"/></span></button>; })}</div></aside>
    </div>
    <div className="editor-checkout"><div><small>Ваш набор · {scene.elements.length} элементов</small><strong>{formatPrice(total)}</strong><span>{scene.elements.length ? sceneDescription(scene) : "Добавьте элементы или выберите шаблон"}</span></div><button type="button" className="shop-button" onClick={toCart} disabled={!draftReady || !parsed}><EditorIcon name="basket"/>Добавить в корзину</button></div>
    {notice && <p className="editor-notice" role="status">{notice}</p>}
    <p className="editor-disclaimer">Визуальный макет помогает выбрать состав. Реальная форма и расположение элементов могут отличаться. Цены примерные; в текущем режиме оплата демонстрационная.</p>
  </main>;
}
