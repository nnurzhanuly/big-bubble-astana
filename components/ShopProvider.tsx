"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { products } from "@/lib/content";
import { parseBundle, type BundleConfig } from "@/lib/builder";
import { parseScene, type SceneConfig } from "@/lib/scene";
import { validCartItem, type CartItem } from "@/lib/cart";
type ShopContextValue = { cart: CartItem[]; favorites: string[]; ready: boolean; add: (id: string, quantity?: number) => void; addBundle: (config: BundleConfig) => void; addScene: (config: SceneConfig) => void; setQuantity: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void; toggleFavorite: (id: string) => void };
const ShopContext = createContext<ShopContextValue | null>(null);
const validProductId = (id: string) => products.some((product) => product.id === id);
export function ShopProvider({ children }: { children: React.ReactNode }) { const [cart, setCart] = useState<CartItem[]>([]); const [favorites, setFavorites] = useState<string[]>([]); const [ready, setReady] = useState(false);
  useEffect(() => { try { const storedCart: unknown = JSON.parse(localStorage.getItem("bb-cart") || "[]"); const storedFavorites: unknown = JSON.parse(localStorage.getItem("bb-favorites") || "[]"); if (Array.isArray(storedCart)) setCart(storedCart.filter(validCartItem)); if (Array.isArray(storedFavorites)) setFavorites(storedFavorites.filter((id) => typeof id === "string" && validProductId(id))); } catch { /* ignore damaged local storage */ } setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem("bb-cart", JSON.stringify(cart)); }, [cart, ready]);
  useEffect(() => { if (ready) localStorage.setItem("bb-favorites", JSON.stringify(favorites)); }, [favorites, ready]);
  const add = (id: string, quantity = 1) => { if (!validProductId(id)) return; setCart((items) => { const current = items.find((item) => item.id === id); return current ? items.map((item) => item.id === id ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item) : [...items, { id, quantity: Math.min(99, Math.max(1, quantity)), type: "product" }]; }); };
  const addBundle = (config: BundleConfig) => { const normalized = parseBundle(config); if (normalized) setCart((items) => [...items, { id: `bundle-${crypto.randomUUID()}`, quantity: 1, type: "bundle", config: normalized }]); };
  const addScene = (config: SceneConfig) => { const normalized = parseScene(config); if (normalized) setCart((items) => [...items, { id: `scene-${crypto.randomUUID()}`, quantity: 1, type: "scene", config: normalized }]); };
  const setQuantity = (id: string, quantity: number) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item));
  const remove = (id: string) => setCart((items) => items.filter((item) => item.id !== id)); const clear = () => setCart([]);
  const toggleFavorite = (id: string) => { if (validProductId(id)) setFavorites((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); };
  return <ShopContext.Provider value={{ cart, favorites, ready, add, addBundle, addScene, setQuantity, remove, clear, toggleFavorite }}>{children}</ShopContext.Provider>;
}
export function useShop() { const value = useContext(ShopContext); if (!value) throw new Error("ShopProvider is missing"); return value; }
