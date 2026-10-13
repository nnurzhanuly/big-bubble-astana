import { products } from "./content";

export type SceneKind = "balloon" | "heart" | "star" | "number" | "box" | "arch" | "inscription" | "product";
export type SceneCatalogItem = { id: string; label: string; category: string; kind: SceneKind; color: string; price: number; image?: string; productId?: string; description?: string };
export type SceneElement = { id: string; catalogId: string; x: number; y: number; scale: number; rotation: number; text?: string };
export type SceneConfig = { version: 1; elements: SceneElement[] };
export type SceneTemplate = { id: string; title: string; description: string; elements: Omit<SceneElement, "id">[] };

// Individual components use example prices; complete products always reuse the site catalog's price.
export const sceneComponents: SceneCatalogItem[] = [
  { id: "balloon-blush", label: "Розовый шар", category: "Шары", kind: "balloon", color: "#e9a6bb", price: 2200 },
  { id: "balloon-cream", label: "Жемчужный шар", category: "Шары", kind: "balloon", color: "#f2e8dd", price: 2200 },
  { id: "balloon-gold", label: "Золотой шар", category: "Шары", kind: "balloon", color: "#d4b071", price: 2500 },
  { id: "balloon-sky", label: "Голубой шар", category: "Шары", kind: "balloon", color: "#a9d3e5", price: 2200 },
  { id: "heart-rose", label: "Фольгированное сердце", category: "Акценты", kind: "heart", color: "#c94778", price: 4500 },
  { id: "star-gold", label: "Фольгированная звезда", category: "Акценты", kind: "star", color: "#d7af70", price: 4500 },
  { id: "number-gold", label: "Шар-цифра", category: "Акценты", kind: "number", color: "#c9a369", price: 5500 },
  { id: "gift-box", label: "Подарочная коробка", category: "Детали", kind: "box", color: "#e9c8d1", price: 7000 },
  { id: "balloon-arch", label: "Фотозона / гирлянда", category: "Арки и оформление", kind: "arch", color: "#dfa5af", price: 12000, description: "Арка из шаров в розовых, жемчужных и золотых оттенках" },
  { id: "inscription", label: "Надпись", category: "Детали", kind: "inscription", color: "#79485a", price: 3500 },
];
export const sceneCatalog: SceneCatalogItem[] = [
  ...sceneComponents,
  ...products.map((product) => ({
    id: `product-${product.id}`,
    label: product.title,
    category: product.categoryLabel,
    kind: "product" as const,
    color: "#f5e8ed",
    price: product.price,
    image: product.image,
    productId: product.id,
    description: product.description,
  })),
];
export const sceneCategories = ["Все", ...new Set(sceneCatalog.map((item) => item.category))];
export const sceneCatalogById = new Map(sceneCatalog.map((item) => [item.id, item]));
export const emptyScene: SceneConfig = { version: 1, elements: [] };
export const defaultSceneText = (catalogId: string) => catalogId === "number-gold" ? "1" : catalogId === "inscription" ? "С праздником!" : undefined;
export const sceneTemplates: SceneTemplate[] = [
  { id: "birthday", title: "День рождения", description: "Арка, воздушный букет и подарок", elements: [
    { catalogId: "balloon-arch", x: .38, y: .48, scale: 1, rotation: 0 },
    { catalogId: "balloon-sky", x: .70, y: .48, scale: .82, rotation: -6 },
    { catalogId: "balloon-cream", x: .80, y: .47, scale: .88, rotation: 3 },
    { catalogId: "balloon-gold", x: .75, y: .66, scale: .82, rotation: 4 },
    { catalogId: "balloon-blush", x: .88, y: .56, scale: .88, rotation: 8 },
    { catalogId: "heart-rose", x: .83, y: .29, scale: 1.03, rotation: 8 },
    { catalogId: "gift-box", x: .82, y: .84, scale: .95, rotation: 0 },
  ] },
  { id: "love", title: "Для любимых", description: "Сердца и нежная палитра", elements: [
    { catalogId: "balloon-arch", x: .34, y: .48, scale: .95, rotation: 0 },
    { catalogId: "balloon-cream", x: .36, y: .45, scale: 1.06, rotation: -12 },
    { catalogId: "heart-rose", x: .51, y: .29, scale: 1.08, rotation: 7 },
    { catalogId: "balloon-blush", x: .64, y: .45, scale: 1.04, rotation: 10 },
    { catalogId: "heart-rose", x: .44, y: .62, scale: .82, rotation: -8 },
    { catalogId: "gift-box", x: .63, y: .73, scale: .8, rotation: 0 },
  ] },
  { id: "welcome", title: "Тёплая встреча", description: "Голубые, жемчужные и золотые шары", elements: [
    { catalogId: "balloon-arch", x: .34, y: .48, scale: .95, rotation: 0 },
    { catalogId: "balloon-sky", x: .35, y: .36, scale: 1, rotation: -8 },
    { catalogId: "balloon-cream", x: .50, y: .29, scale: 1, rotation: 3 },
    { catalogId: "balloon-gold", x: .64, y: .37, scale: 1, rotation: 10 },
    { catalogId: "balloon-sky", x: .42, y: .56, scale: .9, rotation: -3 },
    { catalogId: "star-gold", x: .62, y: .59, scale: .95, rotation: 8 },
  ] },
];

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const finiteBetween = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
export function parseScene(value: unknown): SceneConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.version !== 1 || !Array.isArray(input.elements) || input.elements.length < 1 || input.elements.length > 30) return null;
  const ids = new Set<string>();
  const elements: SceneElement[] = [];
  for (const raw of input.elements) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const element = raw as Record<string, unknown>;
    const item = typeof element.catalogId === "string" ? sceneCatalogById.get(element.catalogId) : undefined;
    if (!item || typeof element.id !== "string" || !uuid.test(element.id) || ids.has(element.id)) return null;
    if (!finiteBetween(element.x, 0, 1) || !finiteBetween(element.y, 0, 1) || !finiteBetween(element.scale, .55, 1.85) || !finiteBetween(element.rotation, -180, 180)) return null;
    const text = typeof element.text === "string" ? element.text.trim() : "";
    if (item.kind === "number" && !/^\d{1,2}$/.test(text)) return null;
    if (item.kind === "inscription" && (!text || text.length > 40 || /[\r\n]/.test(text))) return null;
    if (item.kind !== "number" && item.kind !== "inscription" && text) return null;
    ids.add(element.id);
    elements.push({ id: element.id, catalogId: item.id, x: element.x, y: element.y, scale: element.scale, rotation: element.rotation, ...(text ? { text } : {}) });
  }
  return { version: 1, elements };
}
export const scenePrice = (scene: SceneConfig) => scene.elements.reduce((total, element) => total + (sceneCatalogById.get(element.catalogId)?.price ?? 0), 0);
export function sceneDescription(scene: SceneConfig) {
  const counts = new Map<string, number>();
  for (const element of scene.elements) counts.set(element.catalogId, (counts.get(element.catalogId) ?? 0) + 1);
  const parts = [...counts].map(([id, count]) => `${sceneCatalogById.get(id)?.label ?? id} × ${count}`);
  const personalized = scene.elements.filter((element) => element.text).map((element) => element.catalogId === "number-gold" ? `Цифра ${element.text}` : `«${element.text}»`);
  return [...parts, ...personalized].join(" · ");
}
