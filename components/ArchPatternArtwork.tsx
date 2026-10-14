import { archSlotFor, type ArchPattern } from "@/lib/arch";

const palettes: Record<ArchPattern, readonly string[]> = {
  cross: ["#51404b", "#e6b8c8"],
  gradient: ["#e5b5c8", "#ab7193", "#55445e"],
  spiral: ["#d1a96f", "#f0d4d7", "#9d7586"],
  random: ["#dfa4b8", "#9fc9d5", "#d7b47a", "#716277"],
  alternating: ["#473944", "#ebc3d0"],
};

export default function ArchPatternArtwork({ pattern }: { pattern: ArchPattern }) {
  const colors = palettes[pattern];
  const columns = 9;
  const balloons = Array.from({ length: columns * 3 }, (_, index) => {
    const column = Math.floor(index / 3);
    const row = index % 3;
    const theta = Math.PI - Math.PI * column / (columns - 1);
    const radius = 42 + (row - 1) * 7;
    return {
      index,
      x: 60 + radius * Math.cos(theta),
      y: 71 - (48 + (row - 1) * 7) * Math.sin(theta),
      color: colors[archSlotFor(pattern, column, row, columns, colors.length)],
    };
  });

  return <span className="arch-pattern__art" aria-hidden="true">
    <svg viewBox="0 0 120 84" focusable="false">
      <defs>
        <linearGradient id={`pattern-wall-${pattern}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fcf8f5"/>
          <stop offset="1" stopColor="#eee5e2"/>
        </linearGradient>
        <radialGradient id={`pattern-sheen-${pattern}`} cx="30%" cy="23%" r="75%">
          <stop stopColor="#fff" stopOpacity=".65"/>
          <stop offset=".4" stopColor="#fff" stopOpacity=".08"/>
          <stop offset="1" stopColor="#31212b" stopOpacity=".27"/>
        </radialGradient>
      </defs>
      <rect width="120" height="84" fill={`url(#pattern-wall-${pattern})`}/>
      <path d="M14 71 C14 40 31 20 60 20 C89 20 106 40 106 71" fill="none" stroke="#ad9789" strokeWidth="1.5" opacity=".6"/>
      <path d="M5 75H115" stroke="#c9bbb3" strokeWidth=".8" opacity=".7"/>
      {balloons.map(({ index, x, y, color }) => <g key={index}>
        <ellipse cx={x} cy={y + 1.4} rx="6.2" ry="7" fill="#68545d" opacity=".13"/>
        <ellipse cx={x} cy={y} rx="6.2" ry="7" fill={color} stroke="#fff" strokeOpacity=".33" strokeWidth=".45"/>
        <ellipse cx={x} cy={y} rx="6.2" ry="7" fill={`url(#pattern-sheen-${pattern})`}/>
      </g>)}
    </svg>
  </span>;
}
