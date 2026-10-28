export type FibreLine = {
  baseY: number;
  amplitude: number;
  waves: number;
  speed: number;
  phase: number;
  alpha: number;
  pulseOffsets: number[];
  pulseSpeed: number;
};

export type FibrePointer = { x: number; y: number } | null;

export type FibreColors = {
  start: string;
  end: string;
  // Additive blending glows on dark skins but washes out on light ones.
  additive: boolean;
};

type FibreFrame = {
  width: number;
  height: number;
  time: number;
  pointer: FibrePointer;
  lines: FibreLine[];
  colors: FibreColors;
};

const SEGMENT = 10;
const HEX_COLOR = /^#([0-9a-f]{6})$/i;
const POINTER_RADIUS = 220;
const POINTER_PULL = 0.22;

// Small deterministic PRNG so the layout is identical on every load and in tests.
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fading to the same hue at zero alpha avoids the grey fringe "transparent" (black) leaves on light skins.
export function transparentVersion(color: string): string {
  const match = HEX_COLOR.exec(color);
  if (!match?.[1]) return "transparent";
  const value = Number.parseInt(match[1], 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, 0)`;
}

export function createFibreLines(count: number, seed = 7): FibreLine[] {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => {
    const spread = count > 1 ? index / (count - 1) : 0.5;
    return {
      baseY: 0.32 + spread * 0.5 + (random() - 0.5) * 0.04,
      amplitude: 0.03 + random() * 0.06,
      waves: 0.8 + random() * 1.6,
      speed: 0.12 + random() * 0.22,
      phase: random() * Math.PI * 2,
      alpha: 0.28 + random() * 0.42,
      pulseOffsets: [random(), random()],
      pulseSpeed: 0.05 + random() * 0.07,
    };
  });
}

export function fibreY(
  line: FibreLine,
  x: number,
  width: number,
  height: number,
  time: number,
  pointer: FibrePointer,
): number {
  const progress = width > 0 ? x / width : 0;
  const wave = Math.sin(progress * Math.PI * 2 * line.waves + line.phase + time * line.speed);
  const y = line.baseY * height + wave * line.amplitude * height;
  if (!pointer) return y;

  const dx = x - pointer.x;
  const influence = Math.exp(-(dx * dx) / (2 * POINTER_RADIUS * POINTER_RADIUS));
  return y + (pointer.y - y) * POINTER_PULL * influence;
}

function strokeLine(
  context: CanvasRenderingContext2D,
  line: FibreLine,
  frame: FibreFrame,
  lineWidth: number,
  alpha: number,
): void {
  const { width, height, time, pointer } = frame;
  context.globalAlpha = alpha;
  context.lineWidth = lineWidth;
  context.beginPath();
  for (let x = 0; x <= width + SEGMENT; x += SEGMENT) {
    const y = fibreY(line, x, width, height, time, pointer);
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
}

function drawPulses(context: CanvasRenderingContext2D, line: FibreLine, frame: FibreFrame): void {
  const { width, height, time, pointer, colors } = frame;
  for (const offset of line.pulseOffsets) {
    const travel = (((offset + time * line.pulseSpeed) % 1) + 1) % 1;
    const x = travel * (width + 120) - 60;
    const y = fibreY(line, x, width, height, time, pointer);
    const color = travel < 0.55 ? colors.start : colors.end;
    const glow = context.createRadialGradient(x, y, 0, x, y, 22);
    glow.addColorStop(0, color);
    glow.addColorStop(1, transparentVersion(color));
    context.globalAlpha = 0.9;
    context.fillStyle = glow;
    context.fillRect(x - 22, y - 22, 44, 44);
  }
}

export function drawFibreFrame(context: CanvasRenderingContext2D, frame: FibreFrame): void {
  const { width, height, lines, colors } = frame;
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, colors.start);
  gradient.addColorStop(1, colors.end);
  context.strokeStyle = gradient;
  context.lineCap = "round";
  context.globalCompositeOperation = colors.additive ? "lighter" : "source-over";

  for (const line of lines) {
    strokeLine(context, line, frame, 5, line.alpha * 0.12);
    strokeLine(context, line, frame, 1.2, line.alpha);
    drawPulses(context, line, frame);
  }

  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
}
