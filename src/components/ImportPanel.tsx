// src/components/ImportPanel.tsx
import React, { useRef, useState } from "react";
import { ExportFormat, ExportResolution } from "../utils/exportCanvas";

interface ImportPanelProps {
  sceneFile: File | null;
  uiFile: File | null;
  onSceneLoaded: (img: HTMLImageElement, file: File) => void;
  onUiLoaded: (img: HTMLImageElement, file: File) => void;
  onLoadSample: () => void;
  onResetQuad: () => void;
  onDownload: (format: ExportFormat, resolution: ExportResolution) => void;
  hasScene: boolean;
  hasUi: boolean;
}

export default function ImportPanel({
  sceneFile,
  uiFile,
  onSceneLoaded,
  onUiLoaded,
  onLoadSample,
  onResetQuad,
  onDownload,
  hasScene,
  hasUi,
}: ImportPanelProps) {
  const sceneInputRef = useRef<HTMLInputElement>(null);
  const uiInputRef = useRef<HTMLInputElement>(null);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportResolution, setExportResolution] = useState<ExportResolution>("4k");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isDraggingScene, setIsDraggingScene] = useState(false);
  const [isDraggingUi, setIsDraggingUi] = useState(false);

  const processFile = (file: File, onLoaded: (img: HTMLImageElement, file: File) => void) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(`"${file.name}" is not a supported image file. Please upload a PNG, JPG, or WebP image.`);
      return;
    }

    setUploadError(null);
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      onLoaded(img, file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setUploadError(`Failed to load image "${file.name}". File may be corrupted or unreadable.`);
    };

    img.src = url;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (img: HTMLImageElement, file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, onLoaded);
    }
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
    if (file) {
      processFile(file, onLoaded);
    }
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
    <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm w-full max-w-4xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">MockForge Assets & Export</h2>
          <p className="text-sm text-gray-500">
            Upload device scene & UI artwork, adjust perspective, and export in 2K or 4K PNG/JPG.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onLoadSample}
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            ✨ Load Demo Sample
          </button>
          {hasScene && (
            <button
              onClick={onResetQuad}
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset Points
            </button>
          )}

          {hasScene && hasUi && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="text-xs bg-white border border-gray-300 text-gray-800 font-bold rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="png">PNG Format</option>
                <option value="jpg">JPG Format</option>
              </select>

              <select
                value={typeof exportResolution === "string" ? exportResolution : "4k"}
                onChange={(e) => setExportResolution(e.target.value as ExportResolution)}
                className="text-xs bg-white border border-gray-300 text-gray-800 font-bold rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="4k">4K Extreme (3840px)</option>
                <option value="2k">2K Ultra HD (2560px)</option>
                <option value="1k">1K HD (1920px)</option>
                <option value="original">Original Image Size</option>
              </select>

              <button
                onClick={() => onDownload(exportFormat, exportResolution)}
                type="button"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                📥 Export High-Res Canvas
              </button>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
          ⚠️ {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mockup Scene / Device Uploader */}
        <div
          onClick={() => sceneInputRef.current?.click()}
          onDragOver={(e) => handleDragOver(e, setIsDraggingScene)}
          onDragLeave={(e) => handleDragLeave(e, setIsDraggingScene)}
          onDrop={(e) => handleDrop(e, onSceneLoaded, setIsDraggingScene)}
          className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center relative ${
            isDraggingScene
              ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200"
              : sceneFile
              ? "border-emerald-400 bg-emerald-50/30 hover:border-emerald-500"
              : "border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/20"
          }`}
        >
          <input
            ref={sceneInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleInputChange(e, onSceneLoaded)}
          />
          <div className="text-3xl mb-2">{sceneFile ? "🖼️" : "📷"}</div>
          <span className="text-sm font-bold text-gray-800">
            {sceneFile ? sceneFile.name : "1. Upload Device / Scene Image"}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {sceneFile ? "Click or drag to replace scene" : "Drag & Drop or Click to Browse (PNG, JPG, WebP)"}
          </span>
        </div>

        {/* UI Artwork Uploader */}
        <div
          onClick={() => uiInputRef.current?.click()}
          onDragOver={(e) => handleDragOver(e, setIsDraggingUi)}
          onDragLeave={(e) => handleDragLeave(e, setIsDraggingUi)}
          onDrop={(e) => handleDrop(e, onUiLoaded, setIsDraggingUi)}
          className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center relative ${
            isDraggingUi
              ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200"
              : uiFile
              ? "border-indigo-400 bg-indigo-50/30 hover:border-indigo-500"
              : "border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/20"
          }`}
        >
          <input
            ref={uiInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleInputChange(e, onUiLoaded)}
          />
          <div className="text-3xl mb-2">{uiFile ? "🎨" : "📱"}</div>
          <span className="text-sm font-bold text-gray-800">
            {uiFile ? uiFile.name : "2. Upload UI Artwork Screenshot"}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {uiFile ? "Click or drag to replace UI artwork" : "Drag & Drop or Click to Browse (PNG, JPG, WebP)"}
          </span>
        </div>
      </div>
    </div>
  );
}
