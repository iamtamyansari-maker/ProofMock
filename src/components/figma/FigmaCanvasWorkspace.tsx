// src/components/figma/FigmaCanvasWorkspace.tsx
import React, { useState, useEffect, useRef } from "react";
import SceneViewer, { SceneViewerRef } from "../SceneViewer";
import { Quadrilateral, ScreenEffects } from "../../types/geometry";

interface FigmaCanvasWorkspaceProps {
  sceneImage: HTMLImageElement | null;
  uiImage: HTMLImageElement | null;
  quad: Quadrilateral | null;
  effects: ScreenEffects;
  onQuadChange: (newQuad: Quadrilateral) => void;
  viewerRef: React.RefObject<SceneViewerRef>;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  onSceneLoaded?: (img: HTMLImageElement, file: File) => void;
  onUiLoaded?: (img: HTMLImageElement, file: File) => void;
  activeTool?: "move" | "crop" | "pen";
  showHandles?: boolean;
}

export default function FigmaCanvasWorkspace({
  sceneImage,
  uiImage,
  quad,
  effects,
  onQuadChange,
  viewerRef,
  zoomLevel,
  onZoomChange,
  onSceneLoaded,
  onUiLoaded,
  activeTool = "move",
  showHandles = true,
}: FigmaCanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Paste modal state
  const [pastedImage, setPastedImage] = useState<{ img: HTMLImageElement; file: File } | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const handleZoomIn = () => onZoomChange(Math.min(3.5, parseFloat((zoomLevel + 0.15).toFixed(2))));
  const handleZoomOut = () => onZoomChange(Math.max(0.15, parseFloat((zoomLevel - 0.15).toFixed(2))));

  const handleResetZoom = () => {
    onZoomChange(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitScreen = () => {
    onZoomChange(0.85);
    setPanOffset({ x: 0, y: 0 });
  };

  // Clipboard Paste Event Listener (OS Windows to Software Integration)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const file = new File([blob], `clipboard-pasted-${Date.now()}.png`, { type: blob.type || "image/png" });
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => {
              URL.revokeObjectURL(url);
              setPastedImage({ img, file });
            };
            img.src = url;
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  // Copy Canvas to OS Clipboard
  const handleCopyCanvasToClipboard = async () => {
    const canvas = viewerRef.current?.getCanvas();
    if (!canvas) return;

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]).then(() => {
            setCopiedToast(true);
            setTimeout(() => setCopiedToast(false), 2500);
          });
        }
      });
    } catch (err) {
      console.error("Clipboard write error:", err);
    }
  };

  // Non-passive wheel event listener to lock wheel zoom exclusively to canvas workspace
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest("button, select, input, option, .no-zoom")) {
        return;
      }

      e.preventDefault();
      const delta = e.deltaY;
      const factor = delta < 0 ? 1.08 : 0.92;
      const newZoom = Math.max(0.15, Math.min(3.5, zoomLevel * factor));
      onZoomChange(parseFloat(newZoom.toFixed(2)));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [zoomLevel, onZoomChange]);

  // Keyboard shortcut listener (Ctrl + / - / 0, Spacebar pan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spacePressed) {
        setSpacePressed(true);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        handleZoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [zoomLevel, spacePressed]);

  // Pan start/move/end handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (spacePressed || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <main
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`flex-1 bg-[#181818] relative overflow-hidden flex flex-col items-center justify-center select-none ${
        spacePressed ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
    >
      {/* Figma Dot Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Copy Toast Indicator */}
      {copiedToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#ff7000] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl z-50 animate-bounce flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Canvas copied to OS clipboard!
        </div>
      )}

      {/* Clipboard Image Selection Modal */}
      {pastedImage && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 max-w-md w-full shadow-2xl text-center space-y-4">
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
              📋 Image Pasted from OS Clipboard
            </h3>
            <div className="w-full h-40 bg-[#181818] rounded-lg border border-[#333333] overflow-hidden flex items-center justify-center">
              <img src={pastedImage.img.src} alt="Clipboard Content" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-gray-400">
              Where would you like to load this pasted image?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onSceneLoaded?.(pastedImage.img, pastedImage.file);
                  setPastedImage(null);
                }}
                className="py-2 px-3 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] border border-[#383838] text-gray-100 font-semibold text-xs transition-colors"
              >
                🖼️ Mockup Scene
              </button>
              <button
                onClick={() => {
                  onUiLoaded?.(pastedImage.img, pastedImage.file);
                  setPastedImage(null);
                }}
                className="py-2 px-3 rounded-lg bg-[#ff7000] hover:bg-[#ff801a] text-white font-semibold text-xs transition-colors shadow-lg shadow-[#ff7000]/20"
              >
                📱 UI Artwork
              </button>
            </div>
            <button
              onClick={() => setPastedImage(null)}
              className="text-[11px] text-gray-500 hover:text-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Canvas Content (Center Scene or Placeholder Frame Box) */}
      <div
        className="transition-transform duration-75 ease-out flex items-center justify-center p-8 z-10 my-auto"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        {sceneImage ? (
          <SceneViewer
            ref={viewerRef}
            sceneImage={sceneImage}
            uiImage={uiImage}
            quad={quad}
            effects={effects}
            onQuadChange={onQuadChange}
            activeTool={activeTool}
            showHandles={showHandles}
            onUiLoaded={onUiLoaded}
          />
        ) : (
          /* Empty State Box matching Screenshot */
          <div className="w-[460px] h-[280px] bg-[#202020] border border-[#2c2c2c] rounded-xl flex flex-col items-center justify-center shadow-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#282828] border border-[#333333] flex items-center justify-center text-gray-500 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Upload or press <kbd className="px-1.5 py-0.5 bg-[#282828] rounded border border-[#383838] font-mono text-[10px] text-gray-300">Ctrl+V</kbd> to paste a mockup image
            </p>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls Bar (Screenshot Style) */}
      <div className="no-zoom absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#282828] border border-[#333333] text-gray-300 px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-3 z-30 text-xs font-medium select-none">
        <span className="text-gray-300 text-xs font-medium px-1">
          {Math.round(zoomLevel * 100)}%
        </span>

        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          className="text-gray-400 hover:text-gray-100 p-1 rounded transition-colors flex items-center justify-center"
          title="Zoom Out (Ctrl -)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          className="text-gray-400 hover:text-gray-100 p-1 rounded transition-colors flex items-center justify-center"
          title="Zoom In (Ctrl +)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Fit 100% Button */}
        <button
          onClick={handleResetZoom}
          className="bg-[#333333] hover:bg-[#3d3d3d] text-gray-200 text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors border border-[#3e3e3e]"
          title="Fit Canvas to 100%"
        >
          Fit 100%
        </button>

        {sceneImage && (
          <>
            <span className="h-3.5 w-px bg-[#3e3e3e]" />

            {/* Copy Canvas to Clipboard Button */}
            <button
              onClick={handleCopyCanvasToClipboard}
              className="bg-[#ff7000] hover:bg-[#ff801a] text-white text-[11px] font-semibold px-3 py-0.5 rounded-full transition-colors flex items-center gap-1 shadow-sm"
              title="Copy Canvas Result to Windows Clipboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Canvas
            </button>
          </>
        )}
      </div>
    </main>
  );
}
