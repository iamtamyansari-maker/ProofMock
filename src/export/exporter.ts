// src/export/exporter.ts
/**
 * Export utility for MockForge.
 * Takes the preview canvas (or any source canvas) and generates a high‑resolution image
 * in the selected format (png or jpg) and resolution (2k or 4k).
 */

export type ExportFormat = "png" | "jpg";
export type ExportResolution = "2k" | "4k";

export interface ExportOptions {
  /** HTMLCanvasElement to export */
  sourceCanvas: HTMLCanvasElement;
  /** Desired output format */
  format: ExportFormat;
  /** Desired resolution */
  resolution: ExportResolution;
}

/**
 * Compute target width/height based on the source aspect ratio and chosen resolution.
 * For simplicity we treat "2k" as height ~1080px (1920×1080) and "4k" as height ~2160px.
 */
function computeSize(source: HTMLCanvasElement, res: ExportResolution): { width: number; height: number } {
  const aspect = source.width / source.height;
  if (res === "2k") {
    const height = 1080;
    return { width: Math.round(height * aspect), height };
  }
  // 4k
  const height = 2160;
  return { width: Math.round(height * aspect), height };
}

export async function exportCanvas(opts: ExportOptions): Promise<void> {
  const { sourceCanvas, format, resolution } = opts;
  const { width, height } = computeSize(sourceCanvas, resolution);

  // Create an off‑screen canvas at target size
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ctx = off.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context for export canvas");

  // Draw source onto off‑screen canvas using drawImage which scales automatically
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  const mime = format === "png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve) => {
    off.toBlob((b) => resolve(b as Blob), mime);
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mockforge-export-${resolution}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
