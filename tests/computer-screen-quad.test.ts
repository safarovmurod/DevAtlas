import { describe, expect, it } from 'vitest';
import { quadToCssMatrix, smoothstep } from '@/lib/webgl-support';

/** Applies a CSS matrix3d (column-major) to a 2D point, with the perspective divide. */
function apply(matrix: string, x: number, y: number) {
  const m = matrix.slice(9, -1).split(',').map(Number);
  const w = m[3] * x + m[7] * y + m[15];
  return [(m[0] * x + m[4] * y + m[12]) / w, (m[1] * x + m[5] * y + m[13]) / w];
}

describe('DOM screen pinned onto the 3D monitor glass', () => {
  it('maps the four corners of the 1000×625 window onto any projected quad', () => {
    const quads: [number, number][][] = [
      [
        [0, 0],
        [1000, 0],
        [1000, 625],
        [0, 625],
      ],
      [
        [120, 80],
        [520, 60],
        [540, 330],
        [110, 300],
      ],
      [
        [40, 10],
        [300, 40],
        [300, 220],
        [40, 250],
      ],
    ];
    for (const quad of quads) {
      const matrix = quadToCssMatrix(quad, 1000, 625);
      const corners = [
        apply(matrix, 0, 0),
        apply(matrix, 1000, 0),
        apply(matrix, 1000, 625),
        apply(matrix, 0, 625),
      ];
      corners.forEach(([x, y], index) => {
        expect(x).toBeCloseTo(quad[index][0], 3);
        expect(y).toBeCloseTo(quad[index][1], 3);
      });
    }
  });

  it('eases scroll progress between two edges', () => {
    expect(smoothstep(0.2, 0.6, 0)).toBe(0);
    expect(smoothstep(0.2, 0.6, 0.4)).toBeCloseTo(0.5);
    expect(smoothstep(0.2, 0.6, 1)).toBe(1);
  });
});
