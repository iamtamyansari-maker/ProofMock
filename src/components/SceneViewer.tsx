// src/components/SceneViewer.tsx
import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Point, Quadrilateral, ScreenEffects, DEFAULT_SCREEN_EFFECTS } from "../types/geometry";
import { calculateHomography, applyHomography, validateQuadrilateral } from "../engine/homography";

export interface SceneViewerRef {
  getCanvas: () => HTMLCanvasElement | null;
}

interface SceneViewerProps {
  sceneImage: HTMLImageElement | null;
  uiImage: HTMLImageElement | null;
  quad: Quadrilateral | null;
  effects?: ScreenEffects;
  onQuadChange: (newQuad: Quadrilateral) => void;
  activeTool?: "move" | "crop" | "pen";
  showHandles?: boolean;
  onUiLoaded?: (img: HTMLImageElement, file: File) => void;
}

interface BezierNode {
  x: number;
  y: number;
  handleInX?: number;
  handleInY?: number;
  handleOutX?: number;
  handleOutY?: number;
}

const HANDLE_RADIUS = 10;
const SNAP_TOLERANCE = 8;

interface AlignmentGuide {
  type: "v" | "h";
  pos: number;
}

let cachedGreenScreen: HTMLImageElement | null = null;

function getGreenScreenImage(): HTMLImageElement {
  if (cachedGreenScreen) return cachedGreenScreen;

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext("2d")!;

  // Green screen fill matching screenshot (#00e600)
  ctx.fillStyle = "#00e600";
  ctx.fillRect(0, 0, 800, 500);

  // Subtle grid pattern
  ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 500);
    ctx.stroke();
  }
  for (let y = 0; y < 500; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  cachedGreenScreen = img;
  return img;
}

const SceneViewer = forwardRef<SceneViewerRef, SceneViewerProps>(({
  sceneImage,
  uiImage,
  quad,
  effects = DEFAULT_SCREEN_EFFECTS,
  onQuadChange,
  activeTool = "move",
  showHandles = true,
  onUiLoaded,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  // Crop mode state
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [draggingCropHandle, setDraggingCropHandle] = useState<string | null>(null);

  // Pen tool state
  const [penNodes, setPenNodes] = useState<BezierNode[]>([]);
  const [isPathClosed, setIsPathClosed] = useState(false);
  const [activePenNode, setActivePenNode] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  // Initialize default crop box when scene image loads
  useEffect(() => {
    if (sceneImage && !cropBox) {
      const w = sceneImage.naturalWidth || sceneImage.width || 800;
      const h = sceneImage.naturalHeight || sceneImage.height || 600;
      setCropBox({ x: 0, y: 0, w, h });
    }
  }, [sceneImage]);

  // Convert mouse/touch event coordinates to canvas space
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!sceneImage) {
      canvas.width = 800;
      canvas.height = 500;
      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#71717a";
      ctx.font = "400 15px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload a mockup scene image to begin", canvas.width / 2, canvas.height / 2);
      return;
    }

    const sceneWidth = sceneImage.naturalWidth || sceneImage.width || 800;
    const sceneHeight = sceneImage.naturalHeight || sceneImage.height || 600;

    if (canvas.width !== sceneWidth || canvas.height !== sceneHeight) {
      canvas.width = sceneWidth;
      canvas.height = sceneHeight;
    }

    // 1. Draw base scene image (applying Crop if active)
    if (cropBox) {
      ctx.save();
      ctx.drawImage(
        sceneImage,
        cropBox.x, cropBox.y, cropBox.w, cropBox.h,
        0, 0, sceneWidth, sceneHeight
      );
      ctx.restore();
    } else {
      ctx.drawImage(sceneImage, 0, 0, sceneWidth, sceneHeight);
    }

    // 2. Warp UI artwork OR render Green Screen Mockup Quad Placeholder if no UI image loaded
    if (quad) {
      try {
        const renderImage = uiImage || getGreenScreenImage();
        const uiWidth = renderImage.naturalWidth || renderImage.width;
        const uiHeight = renderImage.naturalHeight || renderImage.height;

        if (uiWidth > 0 && uiHeight > 0) {
          const srcQuad: Quadrilateral = [
            { x: 0, y: 0 },
            { x: uiWidth, y: 0 },
            { x: uiWidth, y: uiHeight },
            { x: 0, y: uiHeight },
          ];

          validateQuadrilateral(quad);

          const H = calculateHomography(srcQuad, quad);
          const warpedCanvas = applyHomography(
            renderImage,
            H,
            { width: sceneWidth, height: sceneHeight },
            uiImage ? effects : { ...effects, borderRadius: 0 }
          );

          // Apply Pen Tool Vector Path Cutout Mask if closed path exists
          if (penNodes.length > 2 && isPathClosed) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(penNodes[0].x, penNodes[0].y);
            for (let i = 1; i < penNodes.length; i++) {
              const node = penNodes[i];
              const prev = penNodes[i - 1];
              if (prev.handleOutX !== undefined && node.handleInX !== undefined) {
                ctx.bezierCurveTo(
                  prev.handleOutX, prev.handleOutY!,
                  node.handleInX, node.handleInY!,
                  node.x, node.y
                );
              } else {
                ctx.lineTo(node.x, node.y);
              }
            }
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(warpedCanvas, 0, 0);
            ctx.restore();
          } else {
            ctx.drawImage(warpedCanvas, 0, 0);
          }

          // If showing green screen mockup canvas (no UI image loaded), render central floating '+' button
          if (!uiImage) {
            const cx = (quad[0].x + quad[1].x + quad[2].x + quad[3].x) / 4;
            const cy = (quad[0].y + quad[1].y + quad[2].y + quad[3].y) / 4;

            ctx.save();
            // Outer shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
            ctx.shadowBlur = 14;

            // Dark circular '+' button
            const btnRadius = Math.max(18, Math.round(sceneWidth / 42));
            ctx.beginPath();
            ctx.arc(cx, cy, btnRadius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(18, 18, 20, 0.92)";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.stroke();

            // Plus icon inside button
            const plusSize = Math.round(btnRadius * 0.45);
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(cx - plusSize, cy);
            ctx.lineTo(cx + plusSize, cy);
            ctx.moveTo(cx, cy - plusSize);
            ctx.lineTo(cx, cy + plusSize);
            ctx.stroke();

            // Text pill below plus button
            const labelText = "Add mockup here";
            ctx.font = `600 ${Math.max(11, Math.round(btnRadius * 0.55))}px Inter, sans-serif`;
            const textMetrics = ctx.measureText(labelText);
            const padX = 10;
            const pillW = textMetrics.width + padX * 2;
            const pillH = 22;
            const pillY = cy + btnRadius + 10;

            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.beginPath();
            ctx.roundRect(cx - pillW / 2, pillY, pillW, pillH, 6);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(labelText, cx, pillY + pillH / 2);
            ctx.restore();
          }

          setErrorMessage(null);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Invalid quadrilateral perspective");
      }
    }

    // 3. Render Move Tool Quad Overlay with Soft White Lines & Minimal White L-Bracket Corners
    if (activeTool === "move" && quad && showHandles) {
      ctx.save();
      // Soft semi-transparent white quad frame boundary line
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 4;

      ctx.beginPath();
      ctx.moveTo(quad[0].x, quad[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(quad[i].x, quad[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Draw alignment guides if snapping
      activeGuides.forEach((g) => {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = Math.max(1.5, Math.round(sceneWidth / 600));

        ctx.beginPath();
        if (g.type === "v") {
          ctx.moveTo(g.pos, 0);
          ctx.lineTo(g.pos, sceneHeight);
        } else {
          ctx.moveTo(0, g.pos);
          ctx.lineTo(sceneWidth, g.pos);
        }
        ctx.stroke();
        ctx.restore();
      });

      // Render Minimal Crisp White L-Bracket Corner Handles (Photoshop / Figma Style)
      const armLen = Math.max(16, Math.round(sceneWidth / 55));
      quad.forEach((pt, i) => {
        const prevPt = quad[(i + 3) % 4];
        const nextPt = quad[(i + 1) % 4];

        // Unit vectors along quad edges
        const d1x = nextPt.x - pt.x;
        const d1y = nextPt.y - pt.y;
        const len1 = Math.hypot(d1x, d1y) || 1;
        const u1x = (d1x / len1) * armLen;
        const u1y = (d1y / len1) * armLen;

        const d2x = prevPt.x - pt.x;
        const d2y = prevPt.y - pt.y;
        const len2 = Math.hypot(d2x, d2y) || 1;
        const u2x = (d2x / len2) * armLen;
        const u2y = (d2y / len2) * armLen;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 4;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.lineCap = "round";

        // L-shaped corner bracket
        ctx.beginPath();
        ctx.moveTo(pt.x + u2x, pt.y + u2y);
        ctx.lineTo(pt.x, pt.y);
        ctx.lineTo(pt.x + u1x, pt.y + u1y);
        ctx.stroke();

        // Small white vertex dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      });
    }

    // 4. Render Figma-Style Crop Overlay
    if (activeTool === "crop" && cropBox) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, 0, sceneWidth, cropBox.y);
      ctx.fillRect(0, cropBox.y + cropBox.h, sceneWidth, sceneHeight - (cropBox.y + cropBox.h));
      ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
      ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, sceneWidth - (cropBox.x + cropBox.w), cropBox.h);

      ctx.strokeStyle = "#ff7000";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(cropBox.x + cropBox.w / 3, cropBox.y);
      ctx.lineTo(cropBox.x + cropBox.w / 3, cropBox.y + cropBox.h);
      ctx.moveTo(cropBox.x + (cropBox.w * 2) / 3, cropBox.y);
      ctx.lineTo(cropBox.x + (cropBox.w * 2) / 3, cropBox.y + cropBox.h);
      ctx.moveTo(cropBox.x, cropBox.y + cropBox.h / 3);
      ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h / 3);
      ctx.moveTo(cropBox.x, cropBox.y + (cropBox.h * 2) / 3);
      ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + (cropBox.h * 2) / 3);
      ctx.stroke();

      const handleSize = 10;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#ff7000";
      ctx.lineWidth = 2;
      const cropHandles = [
        { x: cropBox.x, y: cropBox.y },
        { x: cropBox.x + cropBox.w, y: cropBox.y },
        { x: cropBox.x + cropBox.w, y: cropBox.y + cropBox.h },
        { x: cropBox.x, y: cropBox.y + cropBox.h },
      ];
      cropHandles.forEach((h) => {
        ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      });
      ctx.restore();
    }

    // 5. Render Photoshop/Figma Bezier Pen Tool Overlay
    if (activeTool === "pen") {
      ctx.save();
      if (penNodes.length > 0) {
        ctx.beginPath();
        ctx.moveTo(penNodes[0].x, penNodes[0].y);
        for (let i = 1; i < penNodes.length; i++) {
          const node = penNodes[i];
          const prev = penNodes[i - 1];
          if (prev.handleOutX !== undefined && node.handleInX !== undefined) {
            ctx.bezierCurveTo(
              prev.handleOutX, prev.handleOutY!,
              node.handleInX, node.handleInY!,
              node.x, node.y
            );
          } else {
            ctx.lineTo(node.x, node.y);
          }
        }

        if (isPathClosed) {
          ctx.closePath();
        } else if (mousePos) {
          ctx.lineTo(mousePos.x, mousePos.y);
        }

        ctx.strokeStyle = "#00e600";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        if (isPathClosed) {
          ctx.fillStyle = "rgba(0, 230, 118, 0.18)";
          ctx.fill();
        }

        // Render start-node magnetic snapping highlight ring if mouse is close
        if (!isPathClosed && mousePos && penNodes.length > 2) {
          const start = penNodes[0];
          const distToStart = Math.hypot(mousePos.x - start.x, mousePos.y - start.y);
          if (distToStart < 16) {
            ctx.beginPath();
            ctx.arc(start.x, start.y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = "#00e600";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([]);
            ctx.stroke();
          }
        }

        // Render Anchor nodes
        penNodes.forEach((node, i) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = i === activePenNode ? "#00e600" : "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#00e600";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      ctx.restore();
    }
  }, [sceneImage, uiImage, quad, effects, activeGuides, showHandles, activeTool, cropBox, penNodes, isPathClosed, activePenNode, mousePos]);

  useEffect(() => {
    render();
  }, [render]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUiLoaded) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        onUiLoaded(img, file);
      };
      img.src = url;
    }
    e.target.value = "";
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords || !sceneImage) return;

    // Check click on Central '+' button on Green Screen Mockup
    if (!uiImage && quad && onUiLoaded) {
      const cx = (quad[0].x + quad[1].x + quad[2].x + quad[3].x) / 4;
      const cy = (quad[0].y + quad[1].y + quad[2].y + quad[3].y) / 4;
      const distToCenter = Math.hypot(coords.x - cx, coords.y - cy);
      if (distToCenter <= 45) {
        hiddenFileInputRef.current?.click();
        return;
      }
    }

    if (activeTool === "move" && quad && showHandles) {
      const sceneWidth = sceneImage.naturalWidth || sceneImage.width || 800;
      const hitRadius = Math.max(HANDLE_RADIUS * 2, Math.round(sceneWidth / 40));

      let closestIdx: number | null = null;
      let minDist = Infinity;

      quad.forEach((pt, i) => {
        const dx = pt.x - coords.x;
        const dy = pt.y - coords.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= hitRadius && dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      });

      if (closestIdx !== null) {
        setDraggingIndex(closestIdx);
      }
    } else if (activeTool === "crop" && cropBox) {
      const hitR = 16;
      const handles = [
        { id: "nw", x: cropBox.x, y: cropBox.y },
        { id: "ne", x: cropBox.x + cropBox.w, y: cropBox.y },
        { id: "se", x: cropBox.x + cropBox.w, y: cropBox.y + cropBox.h },
        { id: "sw", x: cropBox.x, y: cropBox.y + cropBox.h },
      ];

      const clickedHandle = handles.find((h) => Math.hypot(h.x - coords.x, h.y - coords.y) <= hitR);
      if (clickedHandle) {
        setDraggingCropHandle(clickedHandle.id);
      } else if (
        coords.x >= cropBox.x &&
        coords.x <= cropBox.x + cropBox.w &&
        coords.y >= cropBox.y &&
        coords.y <= cropBox.y + cropBox.h
      ) {
        setDraggingCropHandle("move");
      }
    } else if (activeTool === "pen") {
      const clickedIdx = penNodes.findIndex((n) => Math.hypot(n.x - coords.x, n.y - coords.y) <= 12);
      if (clickedIdx !== -1) {
        setActivePenNode(clickedIdx);
        return;
      }

      if (penNodes.length > 2 && !isPathClosed) {
        const start = penNodes[0];
        const distToStart = Math.sqrt((start.x - coords.x) ** 2 + (start.y - coords.y) ** 2);
        if (distToStart < 16) {
          setIsPathClosed(true);
          return;
        }
      }

      if (!isPathClosed) {
        const newNode: BezierNode = { x: coords.x, y: coords.y };
        setPenNodes([...penNodes, newNode]);
        setActivePenNode(penNodes.length);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords || !sceneImage) return;

    setMousePos(coords);

    const sceneWidth = sceneImage.naturalWidth || sceneImage.width || 800;
    const sceneHeight = sceneImage.naturalHeight || sceneImage.height || 600;

    if (activeTool === "move" && draggingIndex !== null && quad) {
      let targetX = Math.max(0, Math.min(sceneWidth, coords.x));
      let targetY = Math.max(0, Math.min(sceneHeight, coords.y));

      const guides: AlignmentGuide[] = [];
      if (Math.abs(targetX - 0) < SNAP_TOLERANCE) {
        targetX = 0;
        guides.push({ type: "v", pos: 0 });
      } else if (Math.abs(targetX - sceneWidth) < SNAP_TOLERANCE) {
        targetX = sceneWidth;
        guides.push({ type: "v", pos: sceneWidth });
      }

      if (Math.abs(targetY - 0) < SNAP_TOLERANCE) {
        targetY = 0;
        guides.push({ type: "h", pos: 0 });
      } else if (Math.abs(targetY - sceneHeight) < SNAP_TOLERANCE) {
        targetY = sceneHeight;
        guides.push({ type: "h", pos: sceneHeight });
      }

      quad.forEach((pt, idx) => {
        if (idx === draggingIndex) return;
        if (Math.abs(targetX - pt.x) < SNAP_TOLERANCE) {
          targetX = pt.x;
          guides.push({ type: "v", pos: pt.x });
        }
        if (Math.abs(targetY - pt.y) < SNAP_TOLERANCE) {
          targetY = pt.y;
          guides.push({ type: "h", pos: pt.y });
        }
      });

      setActiveGuides(guides);
      const newQuad = [...quad] as Quadrilateral;
      newQuad[draggingIndex] = { x: targetX, y: targetY };
      onQuadChange(newQuad);
    } else if (activeTool === "crop" && draggingCropHandle && cropBox) {
      const cx = Math.max(0, Math.min(sceneWidth, coords.x));
      const cy = Math.max(0, Math.min(sceneHeight, coords.y));

      if (draggingCropHandle === "nw") {
        const nwW = cropBox.x + cropBox.w - cx;
        const nwH = cropBox.y + cropBox.h - cy;
        if (nwW > 20 && nwH > 20) {
          setCropBox({ x: cx, y: cy, w: nwW, h: nwH });
        }
      } else if (draggingCropHandle === "ne") {
        const neW = cx - cropBox.x;
        const neH = cropBox.y + cropBox.h - cy;
        if (neW > 20 && neH > 20) {
          setCropBox({ x: cropBox.x, y: cy, w: neW, h: neH });
        }
      } else if (draggingCropHandle === "se") {
        const seW = cx - cropBox.x;
        const seH = cy - cropBox.y;
        if (seW > 20 && seH > 20) {
          setCropBox({ x: cropBox.x, y: cropBox.y, w: seW, h: seH });
        }
      } else if (draggingCropHandle === "sw") {
        const swW = cropBox.x + cropBox.w - cx;
        const swH = cy - cropBox.y;
        if (swW > 20 && swH > 20) {
          setCropBox({ x: cx, y: cropBox.y, w: swW, h: swH });
        }
      }
    } else if (activeTool === "pen" && activePenNode !== null && ("buttons" in e ? e.buttons === 1 : true)) {
      setPenNodes((prev) =>
        prev.map((n, idx) => (idx === activePenNode ? { ...n, x: coords.x, y: coords.y } : n))
      );
    }
  };

  const handlePointerUp = () => {
    setDraggingIndex(null);
    setDraggingCropHandle(null);
    setActiveGuides([]);
  };

  return (
    <div className="relative w-full max-w-4xl flex flex-col items-center">
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {errorMessage && (
        <div className="mb-3 px-3 py-1.5 bg-amber-950/70 border border-amber-800/60 text-amber-300 text-xs font-normal rounded-md shadow-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="w-full border border-[#2c2c2c] rounded-lg overflow-hidden bg-[#121212] shadow-2xl relative group">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className={`block w-full h-auto select-none touch-none ${
            activeTool === "pen"
              ? "cursor-crosshair"
              : activeTool === "crop"
              ? "cursor-move"
              : showHandles && draggingIndex !== null
              ? "cursor-grabbing"
              : showHandles
              ? "cursor-crosshair"
              : "cursor-default"
          }`}
        />

        {sceneImage && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <div className="bg-[#1e1e1e]/90 backdrop-blur-md text-gray-300 px-3 py-1 rounded-full border border-[#383838] text-[11px] font-medium flex items-center gap-2 pointer-events-auto shadow-lg">
              {activeTool === "move" && (
                <span>📐 Minimal White L-Bracket Quad Handles ({showHandles ? "On" : "Off"})</span>
              )}
              {activeTool === "crop" && <span>✂ Figma Crop Mode</span>}
              {activeTool === "pen" && (
                <span>
                  ✒ Photoshop Bezier Pen Mask: {penNodes.length} nodes {isPathClosed ? "(Closed Path)" : "(Click start node to close)"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {activeTool === "pen" && penNodes.length > 2 && !isPathClosed && (
                <button
                  onClick={() => setIsPathClosed(true)}
                  type="button"
                  className="bg-[#00e600] hover:bg-[#00c800] text-gray-950 font-bold px-2.5 py-1 rounded-full text-[11px] transition-colors shadow-md"
                >
                  Close Path
                </button>
              )}

              {activeTool === "pen" && penNodes.length > 0 && (
                <button
                  onClick={() => {
                    setPenNodes([]);
                    setIsPathClosed(false);
                  }}
                  type="button"
                  className="bg-[#1e1e1e]/90 hover:bg-red-950 text-red-300 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border border-red-800/40 shadow-md"
                >
                  Clear Vector Path
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SceneViewer.displayName = "SceneViewer";
export default SceneViewer;
