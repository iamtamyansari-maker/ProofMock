// src/components/figma/FigmaHeader.tsx
import React from "react";
import { ExportFormat, ExportResolution } from "../../utils/exportCanvas";

export type StudioTool = "move" | "crop" | "pen";

interface FigmaHeaderProps {
  showHandles: boolean;
  onToggleHandles: () => void;
  onLoadSample: () => void;
  onDownload: (format: ExportFormat, resolution: ExportResolution) => void;
  exportFormat: ExportFormat;
  onFormatChange: (fmt: ExportFormat) => void;
  exportResolution: ExportResolution;
  onResolutionChange: (res: ExportResolution) => void;
  hasScene: boolean;
  hasUi: boolean;
  zoomLevel: number;
  onResetZoom: () => void;
  sceneFileName?: string;
  activeTool?: StudioTool;
  onToolChange?: (tool: StudioTool) => void;
  onOpenAbout?: () => void;
}

export default function FigmaHeader({
  showHandles,
  onToggleHandles,
  onLoadSample,
  onDownload,
  exportFormat,
  onFormatChange,
  exportResolution,
  onResolutionChange,
  hasScene,
  hasUi,
  zoomLevel,
  onResetZoom,
  sceneFileName,
  activeTool = "move",
  onToolChange,
  onOpenAbout,
}: FigmaHeaderProps) {
  const docTitle = sceneFileName ? `Perspective_${sceneFileName}` : "Perspective_3D_Mockup.png";

  return (
    <header className="h-11 bg-[#1e1e1e] border-b border-[#2c2c2c] flex items-center justify-between px-3 z-30 select-none text-xs font-normal text-gray-300">
      {/* Left: Brand Logo & Mode Selectors */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center pr-3 border-r border-[#2e2e2e]">
          <img src="/poorfmock-logo.png" alt="ProofMock Logo" className="h-[18px] w-auto object-contain" />
        </div>

        {/* Studio Tool Strip */}
        <div className="flex items-center gap-1 bg-[#282828] p-0.5 rounded-md border border-[#333333]">
          <button
            type="button"
            onClick={() => onToolChange?.("move")}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 text-[11px] transition-colors ${
              activeTool === "move"
                ? "bg-[#ff7000] text-white shadow-sm"
                : "text-gray-300 hover:text-white"
            }`}
            title="Move & Drag Perspective Quad Tool"
          >
            <span className="text-[10px]">↖</span> Move
          </button>

          <button
            type="button"
            onClick={() => onToolChange?.("crop")}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 text-[11px] transition-colors ${
              activeTool === "crop"
                ? "bg-[#ff7000] text-white shadow-sm"
                : "text-gray-300 hover:text-white"
            }`}
            title="Figma-style Image Crop Tool"
          >
            <span className="text-[10px]">✂</span> Crop
          </button>

          <button
            type="button"
            onClick={() => onToolChange?.("pen")}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 text-[11px] transition-colors ${
              activeTool === "pen"
                ? "bg-[#ff7000] text-white shadow-sm"
                : "text-gray-300 hover:text-white"
            }`}
            title="Precision Bezier Pen Path Mask Tool"
          >
            <span className="text-[10px]">✒</span> Pen Tool
          </button>

          <span className="h-3 w-px bg-[#3d3d3d] mx-0.5" />

          <button
            type="button"
            onClick={onToggleHandles}
            className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-medium transition-colors ${
              showHandles
                ? "text-gray-200 bg-[#383838]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            title={showHandles ? "Hide Canvas Handles" : "Show Canvas Handles"}
          >
            <span className="text-[10px]">⤭</span> {showHandles ? "Handles On" : "Handles Off"}
          </button>
        </div>
      </div>

      {/* Center: Perspective Scene Dropdown Pill */}
      <div className="flex items-center justify-center">
        <div className="bg-[#282828] border border-[#333333] hover:border-[#444444] px-3 py-1 rounded-md flex items-center gap-2 cursor-pointer transition-colors group">
          <span className="text-gray-200 font-medium text-xs">
            {sceneFileName ? `Perspective_${sceneFileName}` : "ProofMock_3D.scene"}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#ff7000] shadow-sm shadow-[#ff7000]/50"></span>
          <span className="text-gray-400 text-[10px] group-hover:text-gray-200">▾</span>
        </div>
      </div>

      {/* Right: Creator Profile & Demo Sample */}
      <div className="flex items-center gap-2">
        {/* Creator / Author Info Button */}
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ff7000]/10 border border-[#ff7000]/30 hover:border-[#ff7000] text-[#ff7000] hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="About Creator (Taimoor Ansari)"
          >
            <span>👨‍💻</span>
            <span>Creator Info</span>
          </button>
        )}

        {/* Demo Sample Button */}
        <button
          onClick={onLoadSample}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-gray-300 hover:text-white hover:bg-[#282828] text-xs font-medium transition-colors border border-[#333333]"
          title="Load Interactive Demo Laptop Sample"
        >
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Demo Sample</span>
        </button>
      </div>
    </header>
  );
}
