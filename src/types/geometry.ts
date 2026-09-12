// src/types/geometry.ts

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Quadrilateral = [Point, Point, Point, Point];

export type NotchStyle = "none" | "macbook-notch" | "dynamic-island" | "punch-hole";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export type SurfaceType = "flat" | "cylinder" | "arc";
export type CurveAxis = "horizontal" | "vertical";

export interface CurvedSurfaceEffects {
  surfaceType: SurfaceType;
  /** Curvature depth intensity (-1.0 to 1.0) */
  curvature: number;
  curveAxis: CurveAxis;
}

export interface PenNode {
  id: string;
  point: Point;
  handleIn?: Point;
  handleOut?: Point;
}

export interface VectorPath {
  nodes: PenNode[];
  closed: boolean;
}

export interface ScreenEffects {
  /** Global or fallback corner rounding radius (0 to 60px) */
  borderRadius: number;

  /** Individual corner radii */
  cornerTL: number;
  cornerTR: number;
  cornerBR: number;
  cornerBL: number;
  lockUniformCorners: boolean;

  /** Glass reflection glare intensity (0.0 to 1.0) */
  glareIntensity: number;

  /** Glass reflection angle in degrees (0 to 360) */
  glareAngle: number;

  /** Inner bezel shadow opacity (0.0 to 1.0) */
  innerShadow: number;

  /** Device webcam/sensor notch cutout */
  notchStyle: NotchStyle;

  /** 3D Curved Surface Smart Object parameters */
  curvedSurface: CurvedSurfaceEffects;
}

export const DEFAULT_CURVED_SURFACE: CurvedSurfaceEffects = {
  surfaceType: "flat",
  curvature: 0,
  curveAxis: "horizontal",
};

export const DEFAULT_SCREEN_EFFECTS: ScreenEffects = {
  borderRadius: 16,
  cornerTL: 16,
  cornerTR: 16,
  cornerBR: 16,
  cornerBL: 16,
  lockUniformCorners: true,
  glareIntensity: 0.35,
  glareAngle: 45,
  innerShadow: 0.25,
  notchStyle: "none",
  curvedSurface: DEFAULT_CURVED_SURFACE,
};

export interface AILightingAnalysis {
  detectedAngle: number;
  detectedGlare: number;
  detectedShadow: number;
}
