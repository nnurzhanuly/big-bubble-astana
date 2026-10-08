import Image from "next/image";
import { sceneCatalogById, type SceneCatalogItem, type SceneTemplate } from "@/lib/scene";

type EditorIconName = "search" | "plus" | "clear" | "drag" | "back" | "front" | "copy" | "trash" | "close" | "arrow" | "basket" | "catalog" | "templates";

export function EditorIcon({ name, className }: { name: EditorIconName; className?: string }) {
  const shared = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const, focusable: false as const };
  switch (name) {
    case "search": return <svg {...shared}><circle cx="10.8" cy="10.8" r="6.1"/><path d="m15.3 15.3 4.4 4.4"/></svg>;
    case "plus": return <svg {...shared}><path d="M12 5v14M5 12h14"/></svg>;
    case "clear": return <svg {...shared}><path d="M4.5 7h15M9 7V4.8h6V7m-8.7 0 .8 12.4h9.8L17.7 7M10 10.5v5.8m4-5.8v5.8"/></svg>;
    case "drag": return <svg {...shared}><path d="M12 3v18M3 12h18m-9-9-2.5 2.5M12 3l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5"/></svg>;
    case "back": return <svg {...shared}><rect x="4" y="4" width="11" height="11" rx="1.5"/><path d="M17 8h3v12H8v-3"/></svg>;
    case "front": return <svg {...shared}><rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M7 16H4V4h12v3"/></svg>;
    case "copy": return <svg {...shared}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
    case "trash": return <svg {...shared}><path d="M4.5 7h15M9 7V4.8h6V7m-8.7 0 .8 12.4h9.8L17.7 7M10 10.5v5.8m4-5.8v5.8"/></svg>;
    case "close": return <svg {...shared}><path d="M5 5 19 19M19 5 5 19"/></svg>;
    case "arrow": return <svg {...shared}><path d="M5 19 19 5M9 5h10v10"/></svg>;
    case "basket": return <svg {...shared}><path d="M3.8 10h16.4l-1.4 9.2a1.8 1.8 0 0 1-1.8 1.5H7a1.8 1.8 0 0 1-1.8-1.5L3.8 10Zm3.8 0 2.2-5a2.4 2.4 0 0 1 4.4 0l2.2 5M9.2 14v3.7m2.8-3.7v3.7m2.8-3.7v3.7"/></svg>;
    case "catalog": return <svg {...shared}><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>;
    case "templates": return <svg {...shared}><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>;
  }
}

export function CatalogArtwork({ item }: { item: SceneCatalogItem }) {
  if (item.kind === "product" && item.image) return <span className="editor-catalog__icon editor-catalog__icon--product"><Image src={item.image} alt="" width={54} height={54}/></span>;
  return <span className={`editor-catalog__icon editor-catalog__icon--${item.kind}`}>
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {item.kind === "balloon" && <><path d="M32 47c2 4-3 5-1 8 2 3-1 4 0 6" fill="none" stroke="#ad99a2" strokeWidth="1.3" strokeLinecap="round"/><ellipse cx="32" cy="25" rx="17" ry="21" fill={item.color}/><ellipse cx="26" cy="15" rx="4" ry="7" transform="rotate(22 26 15)" fill="#fff" opacity=".4"/><path d="m32 44-4 6h8l-4-6Z" fill={item.color}/></>}
      {item.kind === "heart" && <><path d="M32 52 11 30C-.5 18 17 3 32 18 47 3 64.5 18 53 30L32 52Z" fill={item.color}/><path d="M14 20c3-6 9-6 12-2" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55"/></>}
      {item.kind === "star" && <><path d="m32 6 7.5 16.3 17.8 2.1-13.1 12.2 3.5 17.6L32 45.4l-15.7 8.8 3.5-17.6L6.7 24.4l17.8-2.1L32 6Z" fill={item.color}/><path d="m32 13 3 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".55"/></>}
      {item.kind === "number" && <text x="32" y="51" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="53" fill={item.color}>1</text>}
      {item.kind === "box" && <><rect x="9" y="26" width="46" height="31" rx="2" fill={item.color} stroke="#bd90a0"/><rect x="6" y="20" width="52" height="9" rx="2" fill="#f6e4e9" stroke="#bd90a0"/><path d="M32 20v37" stroke="#bb8296" strokeWidth="5"/><path d="M32 20c-11-2-12-12-5-12 5 0 6 7 5 12Zm0 0c11-2 12-12 5-12-5 0-6 7-5 12Z" fill="#e5adbf" stroke="#bd90a0"/></>}
      {item.kind === "inscription" && <><text x="32" y="41" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="29" fill={item.color}>Aa</text><path d="M12 47c12 4 28 4 40 0" fill="none" stroke={item.color} strokeWidth="1.3" opacity=".55"/></>}
      {item.kind === "product" && <><rect x="12" y="20" width="40" height="34" rx="3" fill="#e9c8d1"/><path d="M9 21h46v9H9zm23 0v33" fill="#f6e4e9" stroke="#bb8296" strokeWidth="2"/></>}
    </svg>
  </span>;
}

export function TemplateArtwork({ template }: { template: SceneTemplate }) {
  return <svg className="editor-template__art" viewBox="0 0 220 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs><linearGradient id={`template-bg-${template.id}`} x2="0" y2="1"><stop stopColor="#fcf8f7"/><stop offset="1" stopColor="#f6e9ed"/></linearGradient></defs>
    <rect width="220" height="112" fill={`url(#template-bg-${template.id})`}/>
    <path d="M35 112c0-45 34-82 75-82s75 37 75 82" fill="none" stroke="#ead9de" strokeWidth="1.4"/>
    {template.elements.map((element, index) => {
      const item = sceneCatalogById.get(element.catalogId);
      if (!item) return null;
      const x = element.x * 220, y = element.y * 112;
      return <g key={`${element.catalogId}-${index}`} transform={`translate(${x} ${y}) rotate(${element.rotation}) scale(${element.scale})`}>
        {item.kind === "balloon" && <><path d="M0 19c1 10-2 16 1 28" fill="none" stroke="#b8a1a7" strokeWidth=".8"/><ellipse cy="-3" rx="16" ry="21" fill={item.color} stroke="#ffffff80"/><ellipse cx="-5" cy="-10" rx="3" ry="6" fill="#fff" opacity=".42"/><path d="m0 17-3 5h6Z" fill={item.color}/></>}
        {item.kind === "heart" && <path d="M0 19-17 2C-25-6-15-20 0-9 15-20 25-6 17 2L0 19Z" fill={item.color}/>}
        {item.kind === "star" && <path d="m0-22 6 13 14 2-10 10 2 14L0 10l-12 7 2-14-10-10 14-2Z" fill={item.color}/>}
        {item.kind === "number" && <text y="15" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="43" fill={item.color}>{element.text || "1"}</text>}
        {item.kind === "box" && <><rect x="-18" y="-10" width="36" height="27" rx="2" fill={item.color}/><path d="M0-10v27M-19-10h38" stroke="#bb8296" strokeWidth="3"/></>}
      </g>;
    })}
  </svg>;
}
