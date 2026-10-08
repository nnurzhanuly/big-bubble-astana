import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "@/components/ProductDetails";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/content";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const product = products.find((item) => item.id === slug); return { title: product?.title || "Товар" }; }
export function generateStaticParams() { return products.map((product) => ({ slug: product.id })); }
export default async function Page({ params }: Props) { const { slug } = await params; const product = products.find((item) => item.id === slug); if (!product) notFound(); const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4); return <main id="main" className="container detail-page"><nav className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link><span>/</span><Link href={`/catalog?category=${product.category}`}>{product.categoryLabel}</Link><span>/</span>{product.title}</nav><ProductDetails product={product}/><section className="store-section"><div className="store-section__head"><h2>Вам может понравиться<span className="heading-dot">.</span></h2><Link href="/catalog" className="shop-text-link">Весь каталог ↗</Link></div><div className="product-grid">{related.map((item) => <ProductCard product={item} key={item.id}/>)}</div></section></main>; }
