// src/components/figma/FigmaLeftSidebar.tsx
import React, { useRef, useState } from "react";
import { Quadrilateral } from "../../types/geometry";

interface FigmaLeftSidebarProps {
  sceneFile: File | null;
  uiFile: File | null;
  quad: Quadrilateral | null;
  onSceneLoaded: (img: HTMLImageElement, file: File) => void;
  onUiLoaded: (img: HTMLImageElement, file: File) => void;
  onResetQuad: () => void;
  hasScene: boolean;
  hasUi: boolean;
}

export default function FigmaLeftSidebar({
  sceneFile,
  uiFile,
  quad,
  onSceneLoaded,
  onUiLoaded,
  onResetQuad,
  hasScene,
  hasUi,
}: FigmaLeftSidebarProps) {
  const sceneInputRef = useRef<HTMLInputElement>(null);
  const uiInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"layers" | "assets">("assets");
  const [isDraggingScene, setIsDraggingScene] = useState(false);
  const [isDraggingUi, setIsDraggingUi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File, onLoaded: (img: HTMLImageElement, file: File) => void) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg(`"${file.name}" is not a valid image format.`);
      return;
    }
    setErrorMsg(null);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      onLoaded(img, file);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setErrorMsg(`Failed to load "${file.name}".`);
    };
    img.src = url;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (img: HTMLImageElement, file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, onLoaded);
    e.target.value = "";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    onLoaded: (img: HTMLImageElement, file: File) => void,
    setDragState: (dragging: boolean) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, onLoaded);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, setDragState: (dragging: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, setDragState: (dragging: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
  };

  return (
    <aside className="w-64 bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col z-20 select-none text-xs font-normal text-gray-300 h-full overflow-y-auto">
      {/* Sidebar Top Pill Tabs */}
      <div className="p-2 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("layers")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === "layers"
              ? "bg-[#e5e5e5] text-gray-900 font-semibold shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Layers Tree
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assets")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === "assets"
              ? "bg-[#e5e5e5] text-gray-900 font-semibold shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Upload Assets
        </button>
      </div>

      {errorMsg && (
        <div className="m-3 p-2.5 bg-red-950/70 border border-red-800/60 text-red-300 text-[11px] rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* TAB 1: LAYERS TREE */}
      {activeTab === "layers" && (
        <div className="p-3 space-y-4">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">
              Document Layers
            </div>

            <div className="space-y-1.5">
              {/* Layer 1: Quad Frame */}
              <div className="p-2 rounded-lg bg-[#252525] border border-[#303030] flex items-center justify-between group hover:border-[#404040] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-[#ff7000]">📐</span>
                  <span className="font-medium text-gray-200">Perspective Quad</span>
                </div>
                {hasScene && (
                  <button
                    onClick={onResetQuad}
                    className="text-[10px] text-gray-400 hover:text-[#ff7000] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Reset Quad Handles to Default"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Layer 2: UI Artwork */}
              <div
                onClick={() => uiInputRef.current?.click()}
                title={uiFile ? `UI Artwork: ${uiFile.name}` : "Click to upload UI Artwork screenshot"}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  hasUi
                    ? "bg-[#252525] border-[#303030] hover:border-[#404040]"
                    : "bg-[#202020] border-dashed border-[#303030] text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#ff7000] flex-shrink-0">📱</span>
                  <span className="truncate text-gray-200 font-medium">
                    {uiFile ? uiFile.name : "UI Artwork (Empty)"}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 ml-1 flex-shrink-0">
                  {hasUi ? "100%" : "Upload"}
                </span>
              </div>

              {/* Layer 3: Mockup Scene */}
              <div
                onClick={() => sceneInputRef.current?.click()}
                title={sceneFile ? `Mockup Scene: ${sceneFile.name}` : "Click to upload Mockup Scene image"}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  hasScene
                    ? "bg-[#252525] border-[#303030] hover:border-[#404040]"
                    : "bg-[#202020] border-dashed border-[#303030] text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#ff7000] flex-shrink-0">🖼️</span>
                  <span className="truncate text-gray-200 font-medium">
                    {sceneFile ? sceneFile.name : "Mockup Scene (Empty)"}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 ml-1 flex-shrink-0">
                  {hasScene ? "Base" : "Upload"}
                </span>
              </div>
            </div>
          </div>

          {/* Corner Node Coordinates */}
          {quad && (
            <div className="pt-3 border-t border-[#2c2c2c]">
              <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">
                Corner Handle Points
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <div className="p-1.5 bg-[#252525] rounded-md border border-[#303030] flex items-center justify-between" title="Top-Left Handle">
                  <span className="text-red-400 font-medium">TL</span>
                  <span className="text-gray-300">{Math.round(quad[0].x)}, {Math.round(quad[0].y)}</span>
                </div>
                <div className="p-1.5 bg-[#252525] rounded-md border border-[#303030] flex items-center justify-between" title="Top-Right Handle">
                  <span className="text-blue-400 font-medium">TR</span>
                  <span className="text-gray-300">{Math.round(quad[1].x)}, {Math.round(quad[1].y)}</span>
                </div>
                <div className="p-1.5 bg-[#252525] rounded-md border border-[#303030] flex items-center justify-between" title="Bottom-Right Handle">
                  <span className="text-emerald-400 font-medium">BR</span>
                  <span className="text-gray-300">{Math.round(quad[2].x)}, {Math.round(quad[2].y)}</span>
                </div>
                <div className="p-1.5 bg-[#252525] rounded-md border border-[#303030] flex items-center justify-between" title="Bottom-Left Handle">
                  <span className="text-amber-400 font-medium">BL</span>
                  <span className="text-gray-300">{Math.round(quad[3].x)}, {Math.round(quad[3].y)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD ASSETS */}
      {activeTab === "assets" && (
        <div className="p-3.5 space-y-4">
          {/* Section 1: Mockup Scene Image */}
          <div>
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">
              1. MOCKUP SCENE IMAGE
            </div>
            <div
              onClick={() => sceneInputRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, setIsDraggingScene)}
              onDragLeave={(e) => handleDragLeave(e, setIsDraggingScene)}
              onDrop={(e) => handleDrop(e, onSceneLoaded, setIsDraggingScene)}
              title={sceneFile ? sceneFile.name : "Drag & Drop or Click to Upload Scene"}
              className={`p-6 border border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group ${
                isDraggingScene
                  ? "border-[#ff7000] bg-[#ff7000]/10"
                  : sceneFile
                  ? "border-[#ff7000]/50 bg-[#252525]"
                  : "border-[#333333] hover:border-[#ff7000]/50 bg-[#222222]"
              }`}
            >
              <input
                ref={sceneInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleInputChange(e, onSceneLoaded)}
              />
              <div className="w-10 h-10 rounded-xl bg-[#282828] border border-[#383838] group-hover:border-[#ff7000]/40 flex items-center justify-center mb-2.5 transition-colors">
                <svg className="w-5 h-5 text-[#ff7000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" strokeWidth="1.8" />
                </svg>
              </div>
              <span className="font-semibold text-gray-100 text-xs mb-1 truncate max-w-full inline-block">
                {sceneFile ? sceneFile.name : "Choose Scene"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                PNG, JPG, WEBP
              </span>
            </div>
          </div>

          {/* Section 2: UI Artwork Screenshot */}
          <div>
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">
              2. UI ARTWORK SCREENSHOT
            </div>
            <div
              onClick={() => uiInputRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, setIsDraggingUi)}
              onDragLeave={(e) => handleDragLeave(e, setIsDraggingUi)}
              onDrop={(e) => handleDrop(e, onUiLoaded, setIsDraggingUi)}
              title={uiFile ? uiFile.name : "Drag & Drop or Click to Upload UI Artwork"}
              className={`p-6 border border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group ${
                isDraggingUi
                  ? "border-[#ff7000] bg-[#ff7000]/10"
                  : uiFile
                  ? "border-[#ff7000]/50 bg-[#252525]"
                  : "border-[#333333] hover:border-[#ff7000]/50 bg-[#222222]"
              }`}
            >
              <input
                ref={uiInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleInputChange(e, onUiLoaded)}
              />
              <div className="w-10 h-10 rounded-xl bg-[#282828] border border-[#383838] group-hover:border-[#ff7000]/40 flex items-center justify-center mb-2.5 transition-colors">
                <svg className="w-5 h-5 text-[#ff7000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="4" width="10" height="16" rx="2" strokeWidth="1.8" />
                  <line x1="11" y1="17" x2="13" y2="17" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-gray-100 text-xs mb-1 truncate max-w-full inline-block">
                {uiFile ? uiFile.name : "Choose Artwork"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                PNG, JPG, WEBP
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
