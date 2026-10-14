import { sceneCatalogById, scenePrice, sceneTemplates, type SceneElement } from "./scene";

export type ArchHeight = 1 | 1.5 | 2;
export type ArchPattern = "cross" | "gradient" | "spiral" | "random" | "alternating";
export type BalloonSize = "small" | "regular" | "large";
export type BalloonMaterial = "latex" | "pearl" | "metallic";
export type ArchOverride = { index: number; catalogId?: string; size?: BalloonSize; material?: BalloonMaterial };
export type ArchConfig = { version: 1; height: ArchHeight; pattern: ArchPattern; slots: (string | null)[]; overrides: ArchOverride[]; extras: SceneElement[] };
export type ReadyConfig = { version: 1; templateId: string; extras: SceneElement[] };

// These capacities and frame prices are provisional until the workshop supplies its measurements.
export const archHeights = [
  { value: 1 as const, label: "1 м", columns: 8, framePrice: 9000 },
  { value: 1.5 as const, label: "1,5 м", columns: 10, framePrice: 13500 },
  { value: 2 as const, label: "2 м", columns: 12, framePrice: 18000 },
];
export const archPatterns = [
  { id: "cross" as const, label: "X-рисунок", detail: "Цвет рисунка и цвет фона", defaultSlots: 2 },
  { id: "gradient" as const, label: "Градиент", detail: "Плавный переход от края к краю", defaultSlots: 3 },
  { id: "spiral" as const, label: "Спираль", detail: "Диагональные цветные полосы", defaultSlots: 3 },
  { id: "random" as const, label: "Случайная", detail: "Сохранённый неповторяющийся порядок", defaultSlots: 4 },
  { id: "alternating" as const, label: "Чередование", detail: "Ритм цветов по всей арке", defaultSlots: 2 },
];
export const balloonSizes = [
  { id: "small" as const, label: "Малый", cm: 18, factor: .8 },
  { id: "regular" as const, label: "Средний", cm: 23, factor: 1 },
  { id: "large" as const, label: "Крупный", cm: 28, factor: 1.22 },
];
export const balloonMaterials = [
  { id: "latex" as const, label: "Латекс", surcharge: 0 },
  { id: "pearl" as const, label: "Перламутр", surcharge: 250 },
  { id: "metallic" as const, label: "Металлик", surcharge: 350 },
];
export const archBalloonItems = [...sceneCatalogById.values()].filter((item) => item.kind === "balloon");
export const isArchBalloon = (id: string) => sceneCatalogById.get(id)?.kind === "balloon";
export const isReadyExtra = (id: string) => {
  const item = sceneCatalogById.get(id);
  return !!item && (item.kind === "heart" || item.kind === "star" || item.kind === "number" || item.kind === "box" || (item.kind === "product" && item.category === "Подарки и сюрпризы"));
};
export const emptyArch = (): ArchConfig => ({ version: 1, height: 1.5, pattern: "cross", slots: [null, null], overrides: [], extras: [] });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const finiteBetween = (value: unknown, low: number, high: number) => typeof value === "number" && Number.isFinite(value) && value >= low && value <= high;

function parseExtras(raw: unknown, allowed: (id: string) => boolean): SceneElement[] | null {
  if (!Array.isArray(raw) || raw.length > 12) return null;
  const result: SceneElement[] = [];
  const ids = new Set<string>();
  for (const value of raw) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const item = value as Record<string, unknown>;
    if (typeof item.id !== "string" || !uuid.test(item.id) || ids.has(item.id) || typeof item.catalogId !== "string" || !allowed(item.catalogId)) return null;
    if (!finiteBetween(item.x, 0, 1) || !finiteBetween(item.y, 0, 1) || !finiteBetween(item.scale, .55, 1.85) || !finiteBetween(item.rotation, -180, 180)) return null;
    const text = typeof item.text === "string" ? item.text.trim() : undefined;
    const kind = sceneCatalogById.get(item.catalogId)!.kind;
    if (kind === "number" && (!text || !/^\d{1,2}$/.test(text))) return null;
    if (kind === "inscription" && (!text || text.length > 40 || /[\r\n]/.test(text))) return null;
    if (kind !== "number" && kind !== "inscription" && text) return null;
    ids.add(item.id);
    result.push({ id: item.id, catalogId: item.catalogId, x: item.x as number, y: item.y as number, scale: item.scale as number, rotation: item.rotation as number, ...(text ? { text } : {}) });
  }
  return result;
}

export function parseArch(raw: unknown): ArchConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  if (input.version !== 1 || !archHeights.some((item) => item.value === input.height) || !archPatterns.some((item) => item.id === input.pattern) || !Array.isArray(input.slots)) return null;
  const pattern = input.pattern as ArchPattern;
  const maxSlots = pattern === "cross" ? 2 : 6;
  if (input.slots.length < 2 || input.slots.length > maxSlots || (pattern === "cross" && input.slots.length !== 2)) return null;
  if (!input.slots.every((value) => value === null || (typeof value === "string" && isArchBalloon(value)))) return null;
  const height = input.height as ArchHeight;
  const capacity = archHeights.find((item) => item.value === height)!.columns * 3;
  if (!Array.isArray(input.overrides) || input.overrides.length > capacity) return null;
  const overrides: ArchOverride[] = [];
  const seen = new Set<number>();
  for (const value of input.overrides) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const item = value as Record<string, unknown>;
    if (!Number.isInteger(item.index) || (item.index as number) < 0 || (item.index as number) >= capacity || seen.has(item.index as number)) return null;
    if (item.catalogId !== undefined && (typeof item.catalogId !== "string" || !isArchBalloon(item.catalogId))) return null;
    if (item.size !== undefined && !balloonSizes.some((option) => option.id === item.size)) return null;
    if (item.material !== undefined && !balloonMaterials.some((option) => option.id === item.material)) return null;
    seen.add(item.index as number);
    overrides.push({ index: item.index as number, ...(item.catalogId ? { catalogId: item.catalogId as string } : {}), ...(item.size ? { size: item.size as BalloonSize } : {}), ...(item.material ? { material: item.material as BalloonMaterial } : {}) });
  }
  const extras = parseExtras(input.extras, (id) => sceneCatalogById.has(id) && id !== "balloon-arch");
  if (!extras) return null;
  return { version: 1, height, pattern, slots: [...input.slots] as (string | null)[], overrides, extras };
}

export function parseReady(raw: unknown): ReadyConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  if (input.version !== 1 || typeof input.templateId !== "string" || !sceneTemplates.some((item) => item.id === input.templateId)) return null;
  const extras = parseExtras(input.extras, isReadyExtra);
  return extras ? { version: 1, templateId: input.templateId, extras } : null;
}

export function archSlotFor(pattern: ArchPattern, column: number, row: number, columns: number, slotCount: number): number {
  if (pattern === "cross") {
    const edge = column % 2 === 0;
    return edge ? row === 0 || row === 2 ? 0 : 1 : row === 1 ? 0 : 1;
  }
  if (pattern === "gradient") return Math.min(slotCount - 1, Math.floor(column * slotCount / columns));
  if (pattern === "spiral") return (column + row) % slotCount;
  if (pattern === "alternating") return column % slotCount;
  return ((column * 17 + row * 29 + column * row * 7) >>> 0) % slotCount;
}

export type ArchBalloon = { index: number; column: number; row: number; slot: number; catalogId: string | null; size: BalloonSize; material: BalloonMaterial; effectiveFactor: number; price: number };
export function archBalloons(config: ArchConfig): ArchBalloon[] {
  const columns = archHeights.find((item) => item.value === config.height)!.columns;
  const overrides = new Map(config.overrides.map((item) => [item.index, item]));
  const result: ArchBalloon[] = [];
  for (let column = 0; column < columns; column++) for (let row = 0; row < 3; row++) {
    const index = column * 3 + row;
    const slot = archSlotFor(config.pattern, column, row, columns, config.slots.length);
    const baseId = config.slots[slot];
    const override = overrides.get(index);
    const catalogId = baseId ? override?.catalogId ?? baseId : null;
    result.push({ index, column, row, slot, catalogId, size: override?.size ?? "regular", material: override?.material ?? "latex", effectiveFactor: 1, price: 0 });
  }
  // Larger balloons keep their requested size. Immediate neighbours yield first;
  // the resulting effective diameter is what the workshop and price calculation receive.
  for (const balloon of result) {
    if (!balloon.catalogId) continue;
    const requested = balloonSizes.find((item) => item.id === balloon.size)!.factor;
    const neighbours = result.filter((item) => item.catalogId && item.index !== balloon.index && Math.abs(item.column - balloon.column) <= 1 && Math.abs(item.row - balloon.row) <= 1);
    const nextToLarge = neighbours.some((item) => item.size === "large");
    const earlierLarge = neighbours.some((item) => item.size === "large" && item.index < balloon.index);
    balloon.effectiveFactor = balloon.size === "large" && !earlierLarge ? 1.22 : nextToLarge ? Math.min(requested, .8) : requested;
    const item = sceneCatalogById.get(balloon.catalogId)!;
    const material = balloonMaterials.find((option) => option.id === balloon.material)!;
    balloon.price = Math.round((item.price * balloon.effectiveFactor + material.surcharge) / 50) * 50;
  }
  return result;
}

export function archPrice(config: ArchConfig): number {
  const frame = archHeights.find((item) => item.value === config.height)!.framePrice;
  return frame + archBalloons(config).reduce((sum, item) => sum + item.price, 0) + scenePrice({ version: 1, elements: config.extras });
}
export function archDescription(config: ArchConfig): string {
  const balloons = archBalloons(config).filter((item) => item.catalogId);
  const counts = new Map<string, number>();
  for (const balloon of balloons) {
    const key = `${sceneCatalogById.get(balloon.catalogId!)!.label}, ${balloonMaterials.find((item) => item.id === balloon.material)!.label}, ${Math.round(23 * balloon.effectiveFactor)} см`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const pattern = archPatterns.find((item) => item.id === config.pattern)!.label;
  return `Высота ${config.height} м · ${pattern} · ${balloons.length}/${archHeights.find((item) => item.value === config.height)!.columns * 3} шаров · ${[...counts].map(([label, count]) => `${label} × ${count}`).join("; ") || "без шаров"}${config.extras.length ? ` · Дополнения: ${config.extras.map((item) => sceneCatalogById.get(item.catalogId)!.label).join(", ")}` : ""}`;
}
export function readyPrice(config: ReadyConfig): number {
  const template = sceneTemplates.find((item) => item.id === config.templateId)!;
  return template.elements.reduce((sum, element) => sum + sceneCatalogById.get(element.catalogId)!.price, 0) + scenePrice({ version: 1, elements: config.extras });
}
export function readyDescription(config: ReadyConfig): string {
  const template = sceneTemplates.find((item) => item.id === config.templateId)!;
  return `${template.title} · готовая композиция${config.extras.length ? ` · Дополнения: ${config.extras.map((item) => sceneCatalogById.get(item.catalogId)!.label).join(", ")}` : ""}`;
}
