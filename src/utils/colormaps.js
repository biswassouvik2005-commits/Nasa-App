// Pre-computed 256-level colormap lookup tables for high-performance canvas rendering

function createLut(stops) {
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let idx = 0;
    while (idx < stops.length - 2 && stops[idx + 1][0] < t) {
      idx++;
    }
    const s0 = stops[idx];
    const s1 = stops[idx + 1];
    const span = s1[0] - s0[0];
    const factor = span > 0 ? (t - s0[0]) / span : 0;

    lut[i * 3] = Math.round(s0[1] + factor * (s1[1] - s0[1]));
    lut[i * 3 + 1] = Math.round(s0[2] + factor * (s1[2] - s0[2]));
    lut[i * 3 + 2] = Math.round(s0[3] + factor * (s1[3] - s0[3]));
  }
  return lut;
}

// NASA Inferno (Deep space dark -> rich violet -> fiery amber -> bright yellow/white)
const INFERNO_STOPS = [
  [0.0, 5, 5, 12],
  [0.15, 45, 12, 75],
  [0.38, 140, 32, 70],
  [0.65, 230, 95, 25],
  [0.88, 255, 205, 60],
  [1.0, 255, 255, 255]
];

// Deep Space Cyan / Ice
const CYAN_STOPS = [
  [0.0, 4, 7, 14],
  [0.2, 10, 42, 72],
  [0.5, 18, 150, 185],
  [0.8, 110, 225, 245],
  [1.0, 255, 255, 255]
];

// Classic Thermal (Heatvision)
const THERMAL_STOPS = [
  [0.0, 0, 0, 10],
  [0.2, 20, 20, 180],
  [0.4, 0, 175, 180],
  [0.6, 30, 210, 40],
  [0.8, 240, 200, 20],
  [0.95, 245, 40, 20],
  [1.0, 255, 255, 255]
];

export const COLORMAP_LUTS = {
  inferno: createLut(INFERNO_STOPS),
  cyan: createLut(CYAN_STOPS),
  thermal: createLut(THERMAL_STOPS),
};

export const COLORMAP_OPTIONS = [
  { id: 'inferno', name: 'NASA Inferno', previewBg: 'from-amber-500 via-rose-600 to-indigo-950' },
  { id: 'cyan', name: 'Deep Space Cyan', previewBg: 'from-cyan-400 via-blue-600 to-slate-950' },
  { id: 'thermal', name: 'Heat Thermal', previewBg: 'from-yellow-400 via-red-500 to-blue-900' },
  { id: 'classic', name: 'Classic Blue', previewBg: 'from-amber-400 via-indigo-600 to-blue-900' },
];
