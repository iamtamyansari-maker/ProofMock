import { describe, it, expect } from "vitest";
import { computeTargetSize, exportCanvas } from "./exportCanvas";

describe("exportCanvas Utility", () => {
  describe("computeTargetSize", () => {
    it("returns original size when resolution is 'original'", () => {
      const size = computeTargetSize(1000, 500, "original");
      expect(size).toEqual({ width: 1000, height: 500 });
    });

    it("scales correctly for 4k resolution preset (max dimension 3840)", () => {
      const size = computeTargetSize(1000, 500, "4k");
      expect(size.width).toBe(3840);
      expect(size.height).toBe(1920);
    });

    it("scales correctly for 2k resolution preset (max dimension 2560)", () => {
      const size = computeTargetSize(1920, 1080, "2k");
      expect(size.width).toBe(2560);
      expect(size.height).toBe(1440);
    });

    it("scales correctly for 1k resolution preset (max dimension 1920)", () => {
      const size = computeTargetSize(800, 600, "1k");
      expect(size.width).toBe(1920);
      expect(size.height).toBe(1440);
    });

    it("returns custom size when Size object is passed", () => {
      const size = computeTargetSize(800, 600, { width: 1200, height: 900 });
      expect(size).toEqual({ width: 1200, height: 900 });
    });
  });
});
