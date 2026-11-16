/**
 * True when the browser can draw the 3D scene without hurting the page: WebGL works and
 * the device is not obviously weak (2 cores / 2 GB or less) and the visitor did not ask
 * to save data. Otherwise the landing shows the flat 2D computer instead.
 */
export function canUse3D(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData) return false;
    if ((nav.deviceMemory ?? 8) <= 2) return false;
    if ((nav.hardwareConcurrency ?? 8) <= 2) return false;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // Give the probe context back at once; browsers limit live contexts.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Scroll progress helpers for the computer scene (0 → 1). */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type Point = [number, number];

/**
 * CSS matrix3d that maps a width×height element (transform-origin 0 0) onto a quad given as
 * top-left, top-right, bottom-right, bottom-left points (Heckbert's square-to-quad mapping).
 * This keeps the real DOM screen glued to the 3D monitor glass, perspective included.
 */
export function quadToCssMatrix(quad: Point[], width: number, height: number): string {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const dx1 = x1 - x2,
    dx2 = x3 - x2,
    dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2,
    dy2 = y3 - y2,
    dy3 = y0 - y1 + y2 - y3;
  let g = 0,
    h = 0;
  const det = dx1 * dy2 - dx2 * dy1;
  if ((Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) && Math.abs(det) > 1e-12) {
    g = (dx3 * dy2 - dx2 * dy3) / det;
    h = (dx1 * dy3 - dx3 * dy1) / det;
  }
  const a = x1 - x0 + g * x1,
    b = x3 - x0 + h * x3,
    c = x0;
  const d = y1 - y0 + g * y1,
    e = y3 - y0 + h * y3,
    f = y0;
  const values = [
    a / width,
    d / width,
    0,
    g / width,
    b / height,
    e / height,
    0,
    h / height,
    0,
    0,
    1,
    0,
    c,
    f,
    0,
    1,
  ];
  return `matrix3d(${values.map((value) => (Number.isFinite(value) ? value : 0)).join(',')})`;
}
