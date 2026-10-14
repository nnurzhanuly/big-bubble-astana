export const constructorImages = {
  arch: "/images/constructor-arch-real.png",
  latex: "/images/constructor-latex-real.png",
  latexExtra: "/images/constructor-latex-extra-real.png",
  accents: "/images/constructor-accents-real.png",
} as const;

type Sprite = { asset: "latex" | "latexExtra" | "accents"; cell: readonly [0 | 1, 0 | 1] };

// The same product cutouts are used by catalog tiles and the editable scene.
export const constructorSprites: Record<string, Sprite> = {
  "balloon-blush": { asset: "latex", cell: [0, 0] },
  "balloon-cream": { asset: "latex", cell: [1, 0] },
  "balloon-gold": { asset: "latex", cell: [0, 1] },
  "balloon-sky": { asset: "latex", cell: [1, 1] },
  "balloon-white": { asset: "latexExtra", cell: [0, 0] },
  "balloon-black": { asset: "latexExtra", cell: [1, 0] },
  "balloon-lilac": { asset: "latexExtra", cell: [0, 1] },
  "balloon-green": { asset: "latexExtra", cell: [1, 1] },
  "heart-rose": { asset: "accents", cell: [0, 0] },
  "number-gold": { asset: "accents", cell: [1, 0] },
  "gift-box": { asset: "accents", cell: [0, 1] },
  "star-gold": { asset: "accents", cell: [1, 1] },
};
