"use client";
import { useState, type DragEvent, type PointerEvent } from "react";
import { archBalloons, archHeights, type ArchBalloon, type ArchConfig } from "@/lib/arch";
import { sceneCatalogById, type SceneElement } from "@/lib/scene";
import { CatalogArtwork } from "@/components/ConstructorArtwork";

type Props = {
  config: ArchConfig;
  selectedIndex: number | null;
  selectedExtraId: string | null;
  onSelectIndex: (index: number) => void;
  onSelectExtra: (id: string) => void;
  onMoveBalloon: (from: number, to: number) => void;
  onChangeExtra: (id: string, patch: Partial<SceneElement>) => void;
  onDropCatalog: (id: string, x: number, y: number) => void;
};

const WIDTH = 680;
const HEIGHT = 520;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function point(balloon: ArchBalloon, columns: number) {
  const theta = Math.PI - Math.PI * balloon.column / (columns - 1);
  const band = (balloon.row - 1) * 29;
  return { x: 340 + (246 + band) * Math.cos(theta), y: 432 - (292 + band) * Math.sin(theta) };
}
function svgPoint(event: PointerEvent<SVGGElement>, svg: SVGSVGElement) {
  const rect = svg.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * WIDTH / rect.width, y: (event.clientY - rect.top) * HEIGHT / rect.height };
}

export default function ArchCanvas({ config, selectedIndex, selectedExtraId, onSelectIndex, onSelectExtra, onMoveBalloon, onChangeExtra, onDropCatalog }: Props) {
  const [drag, setDrag] = useState<{ index: number; x: number; y: number } | null>(null);
  const [extraDrag, setExtraDrag] = useState<{ id: string; pointerId: number } | null>(null);
  const balloons = archBalloons(config);
  const columns = archHeights.find((item) => item.value === config.height)!.columns;
  const filled = balloons.filter((item) => item.catalogId);
  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/x-bigbubble-element");
    const rect = event.currentTarget.getBoundingClientRect();
    onDropCatalog(id, clamp((event.clientX - rect.left) / rect.width, .03, .97), clamp((event.clientY - rect.top) / rect.height, .03, .97));
  }
  function moveExtra(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (extraDrag?.id !== id) return;
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    onChangeExtra(id, { x: clamp((event.clientX - rect.left) / rect.width, .05, .95), y: clamp((event.clientY - rect.top) / rect.height, .05, .95) });
  }
  return <div className="arch-canvas" onDragOver={(event) => { if (event.dataTransfer.types.includes("application/x-bigbubble-element")) event.preventDefault(); }} onDrop={onDrop}>
    <svg className="arch-canvas__drawing" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Арка высотой ${config.height} м. Установлено ${filled.length} из ${balloons.length} шаров.`}>
      <defs>
        <linearGradient id="arch-frame" x1="0" x2="1"><stop stopColor="#c6a98d"/><stop offset=".5" stopColor="#e6d5be"/><stop offset="1" stopColor="#a88c75"/></linearGradient>
        <radialGradient id="arch-gloss" cx="32%" cy="23%" r="68%"><stop stopColor="#fff" stopOpacity=".62"/><stop offset=".32" stopColor="#fff" stopOpacity=".16"/><stop offset="1" stopColor="#201018" stopOpacity=".24"/></radialGradient>
        <filter id="arch-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#452d37" floodOpacity=".2"/></filter>
      </defs>
      <path d="M 94 432 C 94 228 188 118 340 118 C 492 118 586 228 586 432" fill="none" stroke="#a98a74" strokeWidth="8" strokeLinecap="round" opacity=".4"/>
      <path d="M 94 432 C 94 228 188 118 340 118 C 492 118 586 228 586 432" fill="none" stroke="url(#arch-frame)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M 68 436 h 51 M 561 436 h 51" stroke="#a88a78" strokeWidth="7" strokeLinecap="round"/>
      {balloons.filter((balloon) => balloon.catalogId).map((balloon) => {
        const item = sceneCatalogById.get(balloon.catalogId!)!;
        const p = drag?.index === balloon.index ? drag : point(balloon, columns);
        const radius = 33 * balloon.effectiveFactor;
        return <g key={balloon.index} role="button" tabIndex={0} aria-label={`${item.label}, позиция ${balloon.index + 1}, ${Math.round(23 * balloon.effectiveFactor)} см`} aria-pressed={selectedIndex === balloon.index}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectIndex(balloon.index); } }}
          onPointerDown={(event) => { onSelectIndex(balloon.index); event.currentTarget.setPointerCapture(event.pointerId); setDrag({ index: balloon.index, ...svgPoint(event, event.currentTarget.ownerSVGElement!) }); }}
          onPointerMove={(event) => { if (drag?.index === balloon.index) setDrag({ index: balloon.index, ...svgPoint(event, event.currentTarget.ownerSVGElement!) }); }}
          onPointerUp={(event) => { if (drag?.index === balloon.index) { const here = svgPoint(event, event.currentTarget.ownerSVGElement!); let nearest = balloon.index, distance = Infinity; for (const target of balloons.filter((entry) => entry.catalogId)) { const p = point(target, columns); const next = Math.hypot(here.x - p.x, here.y - p.y); if (next < distance) { distance = next; nearest = target.index; } } if (nearest !== balloon.index) onMoveBalloon(balloon.index, nearest); setDrag(null); } }}
          onPointerCancel={() => setDrag(null)} style={{ cursor: "grab", touchAction: "none" }}>
          <ellipse cx={p.x} cy={p.y} rx={radius * .94} ry={radius * 1.03} fill={item.color} stroke={selectedIndex === balloon.index ? "#a82755" : "#fff7"} strokeWidth={selectedIndex === balloon.index ? 2.5 : .7} filter="url(#arch-shadow)"/>
          <ellipse cx={p.x} cy={p.y} rx={radius * .94} ry={radius * 1.03} fill="url(#arch-gloss)" pointerEvents="none"/>
          <ellipse cx={p.x - radius * .26} cy={p.y - radius * .36} rx={radius * .16} ry={radius * .25} fill="#fff" opacity={balloon.material === "metallic" ? .78 : .45} transform={`rotate(-27 ${p.x - radius * .26} ${p.y - radius * .36})`} pointerEvents="none"/>
        </g>;
      })}
      <text x="340" y="481" textAnchor="middle" fill="#796c6b" fontSize="12" fontFamily="Arial, sans-serif">Высота арки {config.height} м · {filled.length} из {balloons.length} шаров</text>
    </svg>
    {config.extras.map((element) => {
      const item = sceneCatalogById.get(element.catalogId);
      if (!item) return null;
      return <button key={element.id} type="button" className={`arch-canvas__extra ${item.kind === "inscription" ? "arch-canvas__extra--inscription" : ""} ${selectedExtraId === element.id ? "is-selected" : ""}`} style={{ left: `${element.x * 100}%`, top: `${element.y * 100}%`, transform: `translate(-50%,-50%) scale(${element.scale}) rotate(${element.rotation}deg)` }} aria-label={`${item.label}, переместить`} onClick={() => onSelectExtra(element.id)} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setExtraDrag({ id: element.id, pointerId: event.pointerId }); onSelectExtra(element.id); }} onPointerMove={(event) => moveExtra(event, element.id)} onPointerUp={() => setExtraDrag(null)} onPointerCancel={() => setExtraDrag(null)}>{item.kind === "inscription" ? <span className="arch-canvas__inscription">{element.text || "С праздником!"}</span> : item.kind === "number" && (element.text || "1") !== "1" ? <span className="arch-canvas__number">{element.text}</span> : <CatalogArtwork item={item}/>}</button>;
    })}
    {!filled.length && <div className="arch-canvas__hint"><strong>Выберите шар для слота</strong><span>Перетащите его из каталога или нажмите на товар слева</span></div>}
  </div>;
}
