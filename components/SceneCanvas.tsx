"use client";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Ellipse, Group, Image as KonvaImage, Layer, Line, Rect, RegularPolygon, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { sceneCatalogById, type SceneConfig, type SceneElement } from "@/lib/scene";
import { constructorImages, constructorSprites } from "@/lib/constructor-assets";
import { EditorIcon } from "@/components/ConstructorArtwork";

const BASE_WIDTH = 680;
const BASE_HEIGHT = 520;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
type SceneAssets = { [K in keyof typeof constructorImages]: HTMLImageElement | null };
function cellCrop(image: HTMLImageElement, [column, row]: readonly [number, number]) { return { x: column * image.width / 2, y: row * image.height / 2, width: image.width / 2, height: image.height / 2 }; }

type Props = {
  scene: SceneConfig;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<SceneElement>) => void;
  onDropCatalog: (catalogId: string, x: number, y: number) => void;
  lockedIds?: string[];
};

function ProductArtwork({ src, title }: { src: string; title: string }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const asset = new window.Image();
    asset.onload = () => setImage(asset);
    asset.onerror = () => setImage(null);
    asset.src = src;
    return () => { asset.onload = null; asset.onerror = null; };
  }, [src]);
  const crop = image ? (() => {
    const ratio = Math.max(136 / image.width, 102 / image.height);
    const width = 136 / ratio, height = 102 / ratio;
    return { x: (image.width - width) / 2, y: (image.height - height) / 2, width, height };
  })() : undefined;
  return <>
    <Rect x={-72} y={-82} width={144} height={164} cornerRadius={5} fill="#fff" shadowColor="#6a4653" shadowBlur={14} shadowOpacity={.24}/>
    <Rect x={-68} y={-78} width={136} height={102} fill="#f1e3e8"/>
    {image && <KonvaImage x={-68} y={-78} width={136} height={102} image={image} crop={crop}/>}
    <Text x={-64} y={31} width={128} height={43} text={title} fontSize={12} fontStyle="bold" align="center" verticalAlign="middle" fill="#392d35" wrap="word"/>
  </>;
}

function SceneObject({ element, selected, locked, onSelect, onChange, assets }: {
  element: SceneElement;
  selected: boolean;
  locked: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<SceneElement>) => void;
  assets: SceneAssets;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const item = sceneCatalogById.get(element.catalogId);
  useEffect(() => {
    const transformer = transformerRef.current;
    if (selected && transformer && groupRef.current) {
      transformer.nodes([groupRef.current]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selected]);
  if (!item) return null;
  const balloon = item.kind === "balloon";
  const sprite = constructorSprites[item.id];
  const balloonImage = balloon && sprite && sprite.asset !== "accents" ? assets[sprite.asset] : null;
  const accentImage = sprite?.asset === "accents" ? assets.accents : null;
  const realAccent = item.kind !== "number" || (element.text || "1") === "1";
  return <>
    <Group
      ref={groupRef}
      x={element.x * BASE_WIDTH}
      y={element.y * BASE_HEIGHT}
      scaleX={element.scale}
      scaleY={element.scale}
      rotation={element.rotation}
      draggable={!locked}
      onClick={() => { if (!locked) onSelect(); }}
      onTap={() => { if (!locked) onSelect(); }}
      onDragStart={() => { if (!locked) onSelect(); }}
      onDragEnd={(event) => {
        const x = clamp(event.target.x() / BASE_WIDTH, .035, .965);
        const y = clamp(event.target.y() / BASE_HEIGHT, .05, .95);
        event.target.position({ x: x * BASE_WIDTH, y: y * BASE_HEIGHT });
        onChange({ x, y });
      }}
      onTransformEnd={(event) => {
        const node = event.target;
        const scale = clamp(node.scaleX(), .55, 1.85);
        node.scale({ x: scale, y: scale });
        onChange({
          x: clamp(node.x() / BASE_WIDTH, .035, .965),
          y: clamp(node.y() / BASE_HEIGHT, .05, .95),
          scale,
          rotation: clamp(node.rotation(), -180, 180),
        });
      }}
    >
      {balloon && balloonImage && sprite && <KonvaImage image={balloonImage} crop={cellCrop(balloonImage, sprite.cell)} x={-75} y={-60} width={150} height={150} shadowColor="#614959" shadowBlur={7} shadowOpacity={.12}/>}
      {balloon && !balloonImage && <>
        <Line points={[0, 38, 4, 65, -2, 92, 0, 122]} stroke="#9b8b91" strokeWidth={1.3} listening={false}/>
        <Ellipse x={0} y={-6} radiusX={36} radiusY={45} fillRadialGradientStartPoint={{x:-12,y:-21}} fillRadialGradientEndPoint={{x:0,y:0}} fillRadialGradientStartRadius={3} fillRadialGradientEndRadius={53} fillRadialGradientColorStops={[0,"#ffffff",.22,item.color,1,item.color]} stroke="#ffffff88" strokeWidth={1} shadowColor="#71505d" shadowBlur={13} shadowOpacity={.22}/>
        <RegularPolygon x={0} y={39} sides={3} radius={7} rotation={180} fill={item.color} listening={false}/>
        <Ellipse x={-12} y={-22} radiusX={8} radiusY={16} rotation={-28} fill="#ffffff88" listening={false}/>
      </>}
      {item.kind === "arch" && assets.arch && <KonvaImage image={assets.arch} x={-245} y={-230} width={520} height={475} shadowColor="#715c62" shadowBlur={9} shadowOpacity={.08}/>}
      {item.kind === "arch" && !assets.arch && <Rect x={-200} y={-200} width={400} height={400} cornerRadius={190} stroke="#dfc2c9" strokeWidth={26}/>}
      {accentImage && sprite && realAccent && <KonvaImage image={accentImage} crop={cellCrop(accentImage, sprite.cell)} x={item.kind === "box" ? -70 : -60} y={item.kind === "box" ? -62 : -56} width={item.kind === "box" ? 140 : 120} height={item.kind === "box" ? 140 : 120} shadowColor="#614959" shadowBlur={8} shadowOpacity={.12}/>}
      {item.kind === "heart" && !accentImage && <Text x={-47} y={-53} width={94} height={106} text="♥" fontSize={92} align="center" fill={item.color} shadowColor="#6d324b" shadowBlur={12} shadowOpacity={.25}/>}
      {item.kind === "star" && !accentImage && <Text x={-45} y={-51} width={90} height={102} text="★" fontSize={88} align="center" fill={item.color} shadowColor="#6d4f30" shadowBlur={12} shadowOpacity={.25}/>}
      {item.kind === "number" && (!accentImage || !realAccent) && <Text x={-45} y={-55} width={90} height={110} text={element.text || "1"} fontSize={(element.text || "1").length > 1 ? 59 : 90} fontStyle="bold" align="center" fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 90, y: 0 }} fillLinearGradientColorStops={[0, "#80603b", .25, "#f5df9e", .55, "#bc8f50", .78, "#f9e7b5", 1, "#87643d"]} stroke="#947043" strokeWidth={.8} shadowColor="#6d4f30" shadowBlur={10} shadowOpacity={.22}/>}
      {item.kind === "box" && !accentImage && <>
        <Rect x={-53} y={-35} width={106} height={79} cornerRadius={3} fill={item.color} stroke="#c595a4" strokeWidth={2} shadowColor="#6d4252" shadowBlur={13} shadowOpacity={.2}/>
        <Rect x={-58} y={-42} width={116} height={18} cornerRadius={3} fill="#f3dfe5" stroke="#c595a4" strokeWidth={1}/>
        <Rect x={-6} y={-42} width={12} height={86} fill="#bd8295" opacity={.74}/>
        <Text x={-48} y={2} width={96} text="BIG BUBBLE" fontSize={10} fontStyle="bold" align="center" fill="#8e5b6e"/>
      </>}
      {item.kind === "inscription" && <Text x={-105} y={-24} width={210} height={55} text={element.text || "С праздником!"} fontSize={24} fontFamily="Georgia" fontStyle="italic" align="center" fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 210, y: 0 }} fillLinearGradientColorStops={[0, "#684551", .48, "#b88971", 1, "#734a54"]} shadowColor="#50313d" shadowBlur={3} shadowOffsetY={1} shadowOpacity={.22} wrap="word"/>}
      {item.kind === "product" && item.image && <ProductArtwork src={item.image} title={item.label}/>}
    </Group>
    {selected && <Transformer ref={transformerRef} keepRatio rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} anchorSize={10} borderStroke="#aa5070" anchorStroke="#aa5070" anchorFill="#fff"/>}
  </>;
}

export default function SceneCanvas({ scene, selectedId, onSelect, onChange, onDropCatalog, lockedIds = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(BASE_WIDTH);
  const [assets, setAssets] = useState<SceneAssets>({ arch: null, latex: null, latexExtra: null, accents: null });
  useEffect(() => {
    let active = true;
    (Object.keys(constructorImages) as (keyof SceneAssets)[]).forEach((key) => {
      const image = new window.Image();
      image.onload = () => { if (active) setAssets((current) => ({ ...current, [key]: image })); };
      image.src = constructorImages[key];
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  const scale = width / BASE_WIDTH;
  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/x-bigbubble-element");
    if (!sceneCatalogById.has(id)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onDropCatalog(id, clamp((event.clientX - rect.left) / rect.width, .035, .965), clamp((event.clientY - rect.top) / rect.height, .05, .95));
  }
  return <div ref={containerRef} className="scene-canvas" onDragOver={(event) => { if (event.dataTransfer.types.includes("application/x-bigbubble-element")) event.preventDefault(); }} onDrop={drop}>
    <Stage width={width} height={BASE_HEIGHT * scale} onMouseDown={(event) => { if (event.target === event.target.getStage()) onSelect(null); }} onTouchStart={(event) => { if (event.target === event.target.getStage()) onSelect(null); }}>
      <Layer scaleX={scale} scaleY={scale}>
        {scene.elements.map((element) => <SceneObject key={element.id} element={element} selected={element.id === selectedId} locked={lockedIds.includes(element.id)} onSelect={() => onSelect(element.id)} onChange={(patch) => onChange(element.id, patch)} assets={assets}/>)}
      </Layer>
    </Stage>
    {!scene.elements.length && <div className="scene-canvas__empty" aria-hidden="true"><span className="scene-canvas__empty-icon"><EditorIcon name="drag"/></span><strong>Ваша композиция начинается здесь</strong><small>Перетащите элемент на сцену или выберите его в каталоге</small></div>}
  </div>;
}
