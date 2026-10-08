export type BundleSize = "mini" | "classic" | "grand";
export type BundlePalette = "blush" | "pearl" | "rose" | "sky";
export type BundleOccasion = "birthday" | "birth" | "love" | "other";
export type BundleAddon = "inscription" | "number" | "heart" | "box";
export type BundleConfig = { size: BundleSize; palette: BundlePalette; occasion: BundleOccasion; addons: BundleAddon[]; inscription: string; number: string };
export const bundleSizes: { id: BundleSize; label: string; detail: string; price: number }[] = [
  { id: "mini", label: "Мини", detail: "5–7 шаров", price: 14500 },
  { id: "classic", label: "Классик", detail: "10–12 шаров", price: 23500 },
  { id: "grand", label: "Гранд", detail: "16–20 шаров", price: 36500 },
];
export const bundlePalettes: { id: BundlePalette; label: string; colors: string[] }[] = [
  { id: "blush", label: "Нежный розовый", colors: ["#e9a6bb", "#f4dce3", "#b96584", "#f6e8e3"] },
  { id: "pearl", label: "Жемчужный", colors: ["#f1e8de", "#d5c6b7", "#d7b17c", "#fbf6f1"] },
  { id: "rose", label: "Яркая роза", colors: ["#d73f78", "#f184aa", "#a5285e", "#f4c2d3"] },
  { id: "sky", label: "Небесный", colors: ["#b5d7e6", "#e2eff4", "#7cadc7", "#f5f7f5"] },
];
export const bundleOccasions: { id: BundleOccasion; label: string }[] = [
  { id: "birthday", label: "День рождения" }, { id: "birth", label: "Выписка" }, { id: "love", label: "Для любимых" }, { id: "other", label: "Другой повод" },
];
export const bundleAddons: { id: BundleAddon; label: string; price: number }[] = [
  { id: "inscription", label: "Персональная надпись", price: 3500 },
  { id: "number", label: "Шар-цифра", price: 4500 },
  { id: "heart", label: "Фольгированное сердце", price: 3500 },
  { id: "box", label: "Подарочная коробка", price: 7000 },
];
export const defaultBundle: BundleConfig = { size: "classic", palette: "blush", occasion: "birthday", addons: [], inscription: "", number: "" };
export function parseBundle(value: unknown): BundleConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (!bundleSizes.some((item) => item.id === input.size) || !bundlePalettes.some((item) => item.id === input.palette) || !bundleOccasions.some((item) => item.id === input.occasion)) return null;
  if (!Array.isArray(input.addons) || input.addons.length > bundleAddons.length || input.addons.some((id) => !bundleAddons.some((item) => item.id === id)) || new Set(input.addons).size !== input.addons.length) return null;
  const inscription = typeof input.inscription === "string" ? input.inscription.trim() : "";
  const number = typeof input.number === "string" ? input.number.trim() : "";
  if (inscription.length > 40 || /[\r\n]/.test(inscription) || (inscription && !input.addons.includes("inscription"))) return null;
  if (number && (!/^\d{1,2}$/.test(number) || !input.addons.includes("number"))) return null;
  if (input.addons.includes("inscription") && inscription.length < 1) return null;
  if (input.addons.includes("number") && number.length < 1) return null;
  return { size: input.size as BundleSize, palette: input.palette as BundlePalette, occasion: input.occasion as BundleOccasion, addons: [...input.addons].sort() as BundleAddon[], inscription, number };
}
export function bundlePrice(config: BundleConfig): number { return bundleSizes.find((item) => item.id === config.size)!.price + config.addons.reduce((sum, id) => sum + bundleAddons.find((item) => item.id === id)!.price, 0); }
export function bundleDescription(config: BundleConfig): string { const parts = [bundleSizes.find((item) => item.id === config.size)!.label, bundlePalettes.find((item) => item.id === config.palette)!.label, bundleOccasions.find((item) => item.id === config.occasion)!.label]; if (config.addons.length) parts.push(config.addons.map((id) => bundleAddons.find((item) => item.id === id)!.label).join(", ")); if (config.inscription) parts.push(`«${config.inscription}»`); if (config.number) parts.push(`Цифра ${config.number}`); return parts.join(" · "); }
