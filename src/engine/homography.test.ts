import { describe, it, expect } from "vitest";
import {
  orderQuadrilateralPoints,
  validateQuadrilateral,
  calculateHomography,
  analyzeEnvironmentLighting
} from "./homography";
import { Point, Quadrilateral } from "../types/geometry";

describe("Homography Engine", () => {
  describe("orderQuadrilateralPoints", () => {
    it("orders points clockwise starting from top-left", () => {
      // Given 4 points in arbitrary order
      const pts: Point[] = [
        { x: 100, y: 100 }, // BR
        { x: 0, y: 100 },   // BL
        { x: 0, y: 0 },     // TL
        { x: 100, y: 0 },   // TR
      ];

      const ordered = orderQuadrilateralPoints(pts);
      expect(ordered[0]).toEqual({ x: 0, y: 0 });   // Top-Left
      expect(ordered[1]).toEqual({ x: 100, y: 0 }); // Top-Right
      expect(ordered[2]).toEqual({ x: 100, y: 100 });// Bottom-Right
      expect(ordered[3]).toEqual({ x: 0, y: 100 }); // Bottom-Left
    });

    it("handles slightly tilted quadrilaterals correctly", () => {
      // Slightly tilted rectangle where TL is at (2, 2), TR is at (98, 0)
      const pts: Point[] = [
        { x: 98, y: 0 },   // TR (smaller y, but it's top-right)
        { x: 100, y: 98 }, // BR
        { x: 0, y: 100 },  // BL
        { x: 2, y: 2 },    // TL (top-left point)
      ];

      const ordered = orderQuadrilateralPoints(pts);
      expect(ordered[0]).toEqual({ x: 2, y: 2 });
    });

    it("throws error if not exactly 4 points", () => {
      expect(() => orderQuadrilateralPoints([{ x: 0, y: 0 }] as any)).toThrow();
    });
  });

  describe("validateQuadrilateral", () => {
    it("passes for valid non-degenerate convex quadrilateral", () => {
      const quad: Quadrilateral = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];
      expect(() => validateQuadrilateral(quad)).not.toThrow();
    });

    it("throws for degenerate colinear points", () => {
      const quad: Quadrilateral = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 }, // 3 colinear points
        { x: 50, y: 50 },
      ];
      expect(() => validateQuadrilateral(quad)).toThrow();
    });

    it("throws for self-intersecting (bow-tie) quadrilateral", () => {
      const quad: Quadrilateral = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ];
      expect(() => validateQuadrilateral(quad)).toThrow();
    });
  });

  describe("calculateHomography", () => {
    it("computes identity homography matrix for identical source and destination quads", () => {
      const quad: Quadrilateral = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      const H = calculateHomography(quad, quad);
      // H should be close to 3x3 identity matrix
      expect(H[0][0]).toBeCloseTo(1, 4);
      expect(H[0][1]).toBeCloseTo(0, 4);
      expect(H[0][2]).toBeCloseTo(0, 4);
      expect(H[1][0]).toBeCloseTo(0, 4);
      expect(H[1][1]).toBeCloseTo(1, 4);
      expect(H[1][2]).toBeCloseTo(0, 4);
      expect(H[2][0]).toBeCloseTo(0, 4);
      expect(H[2][1]).toBeCloseTo(0, 4);
      expect(H[2][2]).toBeCloseTo(1, 4);
    });

    it("computes correct transformation for scaled/translated quadrilateral", () => {
      const src: Quadrilateral = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];
      const dst: Quadrilateral = [
        { x: 10, y: 20 },
        { x: 210, y: 20 },
        { x: 210, y: 220 },
        { x: 10, y: 220 },
      ]; // Scale 2x, translate (+10, +20)

      const H = calculateHomography(src, dst);

      // Verify that H maps src[0] to dst[0]
      const p = src[0];
      const w = H[2][0] * p.x + H[2][1] * p.y + 1;
      const xd = (H[0][0] * p.x + H[0][1] * p.y + H[0][2]) / w;
      const yd = (H[1][0] * p.x + H[1][1] * p.y + H[1][2]) / w;

      expect(xd).toBeCloseTo(dst[0].x, 3);
      expect(yd).toBeCloseTo(dst[0].y, 3);
    });

    it("handles large pixel coordinates with high precision (Hartley normalization)", () => {
      const src: Quadrilateral = [
        { x: 0, y: 0 },
        { x: 3840, y: 0 },
        { x: 3840, y: 2160 },
        { x: 0, y: 2160 },
      ];
      const dst: Quadrilateral = [
        { x: 500, y: 200 },
        { x: 3200, y: 400 },
        { x: 2800, y: 1800 },
        { x: 600, y: 1900 },
      ];

      const H = calculateHomography(src, dst);

      // Test mapping for all 4 vertices
      src.forEach((p, idx) => {
        const w = H[2][0] * p.x + H[2][1] * p.y + 1;
        const xd = (H[0][0] * p.x + H[0][1] * p.y + H[0][2]) / w;
        const yd = (H[1][0] * p.x + H[1][1] * p.y + H[1][2]) / w;

        expect(xd).toBeCloseTo(dst[idx].x, 1);
        expect(yd).toBeCloseTo(dst[idx].y, 1);
      });
    });
  });

  describe("analyzeEnvironmentLighting", () => {
    it("returns default lighting parameters for invalid/empty image elements", () => {
      const dummyImg = { naturalWidth: 0, width: 0 } as any;
      const result = analyzeEnvironmentLighting(dummyImg);
      expect(result).toEqual({
        detectedAngle: 45,
        detectedGlare: 0.35,
        detectedShadow: 0.25,
      });
    });
  });
});
