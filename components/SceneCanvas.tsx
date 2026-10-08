"use client";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Ellipse, Group, Image as KonvaImage, Layer, Line, Rect, RegularPolygon, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { sceneCatalogById, type SceneConfig, type SceneElement } from "@/lib/scene";
import { EditorIcon } from "@/components/ConstructorArtwork";

const BASE_WIDTH = 680;
const BASE_HEIGHT = 520;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Props = {
  scene: SceneConfig;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<SceneElement>) => void;
  onDropCatalog: (catalogId: string, x: number, y: number) => void;
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

function SceneObject({ element, selected, onSelect, onChange }: {
  element: SceneElement;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<SceneElement>) => void;
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
  return <>
    <Group
      ref={groupRef}
      x={element.x * BASE_WIDTH}
      y={element.y * BASE_HEIGHT}
      scaleX={element.scale}
      scaleY={element.scale}
      rotation={element.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onSelect}
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
      {balloon && <>
        <Line points={[0, 38, 4, 65, -2, 92, 0, 122]} stroke="#9b8b91" strokeWidth={1.3} listening={false}/>
        <Ellipse x={0} y={-6} radiusX={36} radiusY={45} fill={item.color} stroke="#ffffff88" strokeWidth={2} shadowColor="#71505d" shadowBlur={13} shadowOpacity={.22}/>
        <RegularPolygon x={0} y={39} sides={3} radius={7} rotation={180} fill={item.color} listening={false}/>
        <Ellipse x={-12} y={-22} radiusX={8} radiusY={16} rotation={-28} fill="#ffffff88" listening={false}/>
      </>}
      {item.kind === "heart" && <Text x={-47} y={-53} width={94} height={106} text="♥" fontSize={92} align="center" fill={item.color} shadowColor="#6d324b" shadowBlur={12} shadowOpacity={.25}/>}
      {item.kind === "star" && <Text x={-45} y={-51} width={90} height={102} text="★" fontSize={88} align="center" fill={item.color} shadowColor="#6d4f30" shadowBlur={12} shadowOpacity={.25}/>}
      {item.kind === "number" && <Text x={-45} y={-55} width={90} height={110} text={element.text || "1"} fontSize={90} fontStyle="bold" align="center" fill={item.color} stroke="#9f7744" strokeWidth={.6} shadowColor="#6d4f30" shadowBlur={10} shadowOpacity={.22}/>}
      {item.kind === "box" && <>
        <Rect x={-53} y={-35} width={106} height={79} cornerRadius={3} fill={item.color} stroke="#c595a4" strokeWidth={2} shadowColor="#6d4252" shadowBlur={13} shadowOpacity={.2}/>
        <Rect x={-58} y={-42} width={116} height={18} cornerRadius={3} fill="#f3dfe5" stroke="#c595a4" strokeWidth={1}/>
        <Text x={-48} y={-6} width={96} text="BIG BUBBLE" fontSize={11} fontStyle="bold" align="center" fill="#8e5b6e"/>
      </>}
      {item.kind === "inscription" && <Text x={-105} y={-24} width={210} height={55} text={element.text || "С праздником!"} fontSize={24} fontFamily="Georgia" fontStyle="italic" align="center" fill={item.color} wrap="word"/>}
      {item.kind === "product" && item.image && <ProductArtwork src={item.image} title={item.label}/>}
    </Group>
    {selected && <Transformer ref={transformerRef} keepRatio rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} anchorSize={10} borderStroke="#aa5070" anchorStroke="#aa5070" anchorFill="#fff"/>}
  </>;
}

export default function SceneCanvas({ scene, selectedId, onSelect, onChange, onDropCatalog }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(BASE_WIDTH);
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
        {scene.elements.map((element) => <SceneObject key={element.id} element={element} selected={element.id === selectedId} onSelect={() => onSelect(element.id)} onChange={(patch) => onChange(element.id, patch)}/>)}
      </Layer>
    </Stage>
    {!scene.elements.length && <div className="scene-canvas__empty" aria-hidden="true"><span className="scene-canvas__empty-icon"><EditorIcon name="drag"/></span><strong>Ваша композиция начинается здесь</strong><small>Перетащите элемент на сцену или выберите его в каталоге</small></div>}
  </div>;
}
