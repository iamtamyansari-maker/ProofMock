// src/utils/exportCanvas.ts
import { Quadrilateral, Size, ScreenEffects, DEFAULT_SCREEN_EFFECTS } from "../types/geometry";
import { calculateHomography, applyHomography } from "../engine/homography";

export type ExportFormat = "png" | "jpg" | "jpeg";
export type ExportResolution = "1k" | "2k" | "4k" | "original" | Size;

export interface ExportCanvasOptions {
  /** Source canvas element, or fallback scene/UI images + quad */
  sourceCanvas?: HTMLCanvasElement | null;
  sceneImage?: HTMLImageElement | null;
  uiImage?: HTMLImageElement | null;
  quad?: Quadrilateral | null;

  /** Screen rendering realism effects (rounded corners, glass glare, notch) */
  effects?: Partial<ScreenEffects>;

  /** Export image format: 'png' (default) or 'jpg' / 'jpeg' */
  format?: ExportFormat;

  /** Quality for JPG/JPEG (0.0 to 1.0, default 0.92) */
  quality?: number;

  /** Target resolution scaling: 'original', '1k' (1920px max), '2k' (2560px max), '4k' (3840px max), or custom Size */
  resolution?: ExportResolution;

  /** Target download filename without extension */
  filename?: string;
}

/**
 * Computes target pixel dimensions for given base dimensions and resolution preset.
 */
export function computeTargetSize(
  baseWidth: number,
  baseHeight: number,
  resolution: ExportResolution = "original"
): Size {
  if (typeof resolution === "object" && resolution !== null) {
    return { width: Math.round(resolution.width), height: Math.round(resolution.height) };
  }

  if (resolution === "original" || baseWidth <= 0 || baseHeight <= 0) {
    return { width: baseWidth, height: baseHeight };
  }

  let maxTargetDim = baseWidth;
  if (resolution === "1k") maxTargetDim = 1920;
  else if (resolution === "2k") maxTargetDim = 2560;
  else if (resolution === "4k") maxTargetDim = 3840;

  const currentMax = Math.max(baseWidth, baseHeight);
  const scale = maxTargetDim / currentMax;

  return {
    width: Math.round(baseWidth * scale),
    height: Math.round(baseHeight * scale),
  };
}

/**
 * Renders high-resolution composite canvas and triggers download or returns result.
 */
export function exportCanvas(options: ExportCanvasOptions): {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  filename: string;
} {
  const {
    sourceCanvas,
    sceneImage,
    uiImage,
    quad,
    effects = DEFAULT_SCREEN_EFFECTS,
    format = "png",
    quality = 0.92,
    resolution = "original",
    filename: userFilename,
  } = options;

  let baseW = 800;
  let baseH = 600;

  if (sceneImage) {
    baseW = sceneImage.naturalWidth || sceneImage.width || 800;
    baseH = sceneImage.naturalHeight || sceneImage.height || 600;
  } else if (sourceCanvas) {
    baseW = sourceCanvas.width;
    baseH = sourceCanvas.height;
  }

  const targetSize = computeTargetSize(baseW, baseH, resolution);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = targetSize.width;
  outCanvas.height = targetSize.height;
  const ctx = outCanvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context for export canvas");

  const fmt = (format || "png").toLowerCase();
  const isJpg = fmt === "jpg" || fmt === "jpeg";

  // For JPG format, fill solid white background to avoid transparent black artifacts
  if (isJpg) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetSize.width, targetSize.height);
  }

  if (sceneImage) {
    // Render high-res scene image
    ctx.drawImage(sceneImage, 0, 0, targetSize.width, targetSize.height);

    // If UI artwork and quad exist, warp UI onto scene at target resolution
    if (uiImage && quad) {
      const uiW = uiImage.naturalWidth || uiImage.width;
      const uiH = uiImage.naturalHeight || uiImage.height;

      if (uiW > 0 && uiH > 0) {
        const scaleX = targetSize.width / baseW;
        const scaleY = targetSize.height / baseH;

        // Scale quad points to high-res target size
        const scaledQuad: Quadrilateral = [
          { x: quad[0].x * scaleX, y: quad[0].y * scaleY },
          { x: quad[1].x * scaleX, y: quad[1].y * scaleY },
          { x: quad[2].x * scaleX, y: quad[2].y * scaleY },
          { x: quad[3].x * scaleX, y: quad[3].y * scaleY },
        ];

        const srcQuad: Quadrilateral = [
          { x: 0, y: 0 },
          { x: uiW, y: 0 },
          { x: uiW, y: uiH },
          { x: 0, y: uiH },
        ];

        // Scale border radius and individual corner radii to target resolution
        const scaledEffects: ScreenEffects = {
          ...DEFAULT_SCREEN_EFFECTS,
          ...effects,
          borderRadius: Math.round((effects.borderRadius ?? DEFAULT_SCREEN_EFFECTS.borderRadius) * scaleX),
          cornerTL: Math.round((effects.cornerTL ?? DEFAULT_SCREEN_EFFECTS.cornerTL) * scaleX),
          cornerTR: Math.round((effects.cornerTR ?? DEFAULT_SCREEN_EFFECTS.cornerTR) * scaleX),
          cornerBR: Math.round((effects.cornerBR ?? DEFAULT_SCREEN_EFFECTS.cornerBR) * scaleX),
          cornerBL: Math.round((effects.cornerBL ?? DEFAULT_SCREEN_EFFECTS.cornerBL) * scaleX),
        };

        const H = calculateHomography(srcQuad, scaledQuad);
        const warpedCanvas = applyHomography(uiImage, H, targetSize, scaledEffects);

        ctx.drawImage(warpedCanvas, 0, 0);
      }
    }
  } else if (sourceCanvas) {
    ctx.drawImage(sourceCanvas, 0, 0, targetSize.width, targetSize.height);
  }

  const mimeType = isJpg ? "image/jpeg" : "image/png";
  const dataUrl = outCanvas.toDataURL(mimeType, isJpg ? quality : undefined);

  const ext = isJpg ? "jpg" : "png";
  const finalFilename = userFilename
    ? `${userFilename}.${ext}`
    : `mockforge-${resolution}-${Date.now()}.${ext}`;

  // Auto trigger download if browser environment
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const link = document.createElement("a");
    link.download = finalFilename;
    link.href = dataUrl;
    link.click();
  }

  return {
    canvas: outCanvas,
    dataUrl,
    filename: finalFilename,
  };
}

export default exportCanvas;
