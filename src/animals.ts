export type Point = { x: number; y: number };
export type Stroke = { points: Point[]; closed?: boolean; fill?: string };
export type AnimalDef = {
  name: string;
  emoji: string;
  outlineColor: string;
  sound: string;
  strokes: Stroke[];
};

const p = (x: number, y: number): Point => ({ x, y });

export const ANIMALS: AnimalDef[] = [
  {
    name: "Fish",
    emoji: "🐟",
    outlineColor: "#1cb0f6",
    sound: "Blub blub blub! I am a fish!",
    strokes: [{
      closed: true,
      fill: "#ff9600",
      points: [
        p(0.08, 0.50), p(0.18, 0.36), p(0.34, 0.30), p(0.52, 0.30),
        p(0.66, 0.36), p(0.74, 0.45), p(0.78, 0.50),
        p(0.92, 0.25), p(0.96, 0.50), p(0.92, 0.75),
        p(0.78, 0.50), p(0.74, 0.55), p(0.66, 0.64), p(0.52, 0.70),
        p(0.34, 0.70), p(0.18, 0.64), p(0.08, 0.50),
      ],
    }],
  },
  {
    name: "Cat",
    emoji: "🐱",
    outlineColor: "#7a4a17",
    sound: "Meow! Meow! I am a cat!",
    strokes: [{
      closed: true,
      fill: "#f4a460",
      points: [
        p(0.20, 0.55), p(0.18, 0.40), p(0.22, 0.30),
        p(0.28, 0.22), p(0.30, 0.08), p(0.42, 0.22),
        p(0.50, 0.20), p(0.58, 0.22), p(0.70, 0.08),
        p(0.72, 0.22), p(0.78, 0.30), p(0.82, 0.40), p(0.80, 0.55),
        p(0.75, 0.70), p(0.62, 0.82), p(0.50, 0.85), p(0.38, 0.82),
        p(0.25, 0.70), p(0.20, 0.55),
      ],
    }],
  },
  {
    name: "Duck",
    emoji: "🦆",
    outlineColor: "#b08000",
    sound: "Quack! Quack! I am a duck!",
    strokes: [{
      closed: true,
      fill: "#ffc800",
      points: [
        p(0.18, 0.70), p(0.18, 0.82), p(0.32, 0.88), p(0.62, 0.88),
        p(0.80, 0.82), p(0.92, 0.66), p(0.78, 0.56),
        p(0.62, 0.46), p(0.55, 0.34), p(0.50, 0.22), p(0.38, 0.18),
        p(0.28, 0.24), p(0.06, 0.30),
        p(0.22, 0.42), p(0.38, 0.48), p(0.42, 0.58), p(0.38, 0.68),
        p(0.18, 0.70),
      ],
    }],
  },
  {
    name: "Butterfly",
    emoji: "🦋",
    outlineColor: "#7a2a5c",
    sound: "Flutter flutter! I am a butterfly!",
    strokes: [
      { closed: false, points: [p(0.50, 0.22), p(0.50, 0.80)] },
      { closed: true, fill: "#ff6fb5", points: [
        p(0.50, 0.32), p(0.32, 0.18), p(0.12, 0.30), p(0.06, 0.50),
        p(0.18, 0.66), p(0.50, 0.55), p(0.50, 0.32),
      ]},
      { closed: true, fill: "#ce82ff", points: [
        p(0.50, 0.55), p(0.20, 0.78), p(0.32, 0.86), p(0.50, 0.78),
        p(0.50, 0.55),
      ]},
      { closed: true, fill: "#ff6fb5", points: [
        p(0.50, 0.32), p(0.68, 0.18), p(0.88, 0.30), p(0.94, 0.50),
        p(0.82, 0.66), p(0.50, 0.55), p(0.50, 0.32),
      ]},
      { closed: true, fill: "#ce82ff", points: [
        p(0.50, 0.55), p(0.80, 0.78), p(0.68, 0.86), p(0.50, 0.78),
        p(0.50, 0.55),
      ]},
    ],
  },
  {
    name: "Snail",
    emoji: "🐌",
    outlineColor: "#3a5a1a",
    sound: "Slow and steady! I am a snail!",
    strokes: [
      // body + head
      { closed: true, fill: "#9acd32", points: [
        p(0.08, 0.84), p(0.92, 0.84), p(0.95, 0.70), p(0.86, 0.62),
        p(0.78, 0.66), p(0.62, 0.68), p(0.40, 0.68), p(0.22, 0.66),
        p(0.10, 0.74), p(0.08, 0.84),
      ]},
      // shell (oval)
      { closed: true, fill: "#d2691e", points: [
        p(0.45, 0.22), p(0.62, 0.26), p(0.74, 0.40), p(0.74, 0.55),
        p(0.62, 0.66), p(0.45, 0.68), p(0.28, 0.66), p(0.16, 0.55),
        p(0.16, 0.40), p(0.28, 0.26), p(0.45, 0.22),
      ]},
    ],
  },
  {
    name: "Bee",
    emoji: "🐝",
    outlineColor: "#5a4a00",
    sound: "Buzz buzz! I am a bee!",
    strokes: [
      // body
      { closed: true, fill: "#ffc800", points: [
        p(0.20, 0.50), p(0.24, 0.34), p(0.40, 0.28), p(0.62, 0.30),
        p(0.74, 0.40), p(0.74, 0.60), p(0.62, 0.70), p(0.40, 0.72),
        p(0.24, 0.66), p(0.20, 0.50),
      ]},
      // top wing
      { closed: true, fill: "#cce6ff", points: [
        p(0.46, 0.30), p(0.40, 0.10), p(0.62, 0.10), p(0.60, 0.28),
        p(0.46, 0.30),
      ]},
    ],
  },
];
