// src/components/figma/FigmaRightInspector.tsx
import React from "react";
import { ScreenEffects, NotchStyle } from "../../types/geometry";
import { ExportFormat, ExportResolution } from "../../utils/exportCanvas";

interface FigmaRightInspectorProps {
  effects: ScreenEffects;
  onChangeEffects: (newEffects: ScreenEffects) => void;
  exportFormat: ExportFormat;
  onFormatChange: (fmt: ExportFormat) => void;
  exportResolution: ExportResolution;
  onResolutionChange: (res: ExportResolution) => void;
  onDownload: (format: ExportFormat, resolution: ExportResolution) => void;
  onResetQuad: () => void;
  onFitScreen: () => void;
  hasScene: boolean;
  hasUi: boolean;
  onAutoDetectLighting?: () => void;
}

export default function FigmaRightInspector({
  effects,
  onChangeEffects,
  exportFormat,
  onFormatChange,
  exportResolution,
  onResolutionChange,
  onDownload,
  onResetQuad,
  onFitScreen,
  hasScene,
  hasUi,
  onAutoDetectLighting,
}: FigmaRightInspectorProps) {
  const updateEffect = <K extends keyof ScreenEffects>(key: K, value: ScreenEffects[K]) => {
    onChangeEffects({ ...effects, [key]: value });
  };

  const updateCurvedSurface = (
    key: keyof ScreenEffects["curvedSurface"],
    value: any
  ) => {
    onChangeEffects({
      ...effects,
      curvedSurface: {
        ...effects.curvedSurface,
        [key]: value,
      },
    });
  };

  const handleUniformRadiusChange = (val: number) => {
    onChangeEffects({
      ...effects,
      borderRadius: val,
      cornerTL: val,
      cornerTR: val,
      cornerBR: val,
      cornerBL: val,
    });
  };

  return (
    <aside className="w-64 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col z-20 select-none text-xs font-normal text-gray-300 h-full overflow-y-auto">
      {/* Inspector Title */}
      <div className="p-3 border-b border-[#2c2c2c] bg-[#1e1e1e] flex items-center justify-between">
        <span className="font-bold text-gray-200 text-xs tracking-wider uppercase">
          DESIGN INSPECTOR
        </span>
        <span className="text-[11px] text-gray-500 font-medium">Properties</span>
      </div>

      <div className="p-3.5 space-y-5">
        {/* SECTION 1: TRANSFORM & ALIGNMENT */}
        <div>
          <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">
            TRANSFORM & ALIGNMENT
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onResetQuad}
              disabled={!hasScene}
              type="button"
              className="px-2.5 py-1.5 rounded-md bg-[#2a2a2a] hover:bg-[#333333] border border-[#383838] text-gray-200 font-medium text-xs disabled:opacity-40 transition-colors flex items-center justify-center gap-1 shadow-sm"
              title="Reset Quad Handles to Default Inset (20%)"
            >
              Reset Quad
            </button>

            <button
              onClick={onFitScreen}
              disabled={!hasScene}
              type="button"
              className="px-2.5 py-1.5 rounded-md bg-[#2a2a2a] hover:bg-[#333333] border border-[#383838] text-gray-200 font-medium text-xs disabled:opacity-40 transition-colors flex items-center justify-center gap-1 shadow-sm"
              title="Fit Quad to Full Scene Image (5% Inset)"
            >
              Fit Screen
            </button>
          </div>
        </div>

        {/* SECTION 2: SCREEN FRAMING & INDIVIDUAL CORNER RADIUS */}
        <div className="pt-3 border-t border-[#2c2c2c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              SCREEN FRAMING & RADIUS
            </div>
            <button
              type="button"
              onClick={() => updateEffect("lockUniformCorners", !effects.lockUniformCorners)}
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border transition-colors ${
                effects.lockUniformCorners
                  ? "bg-[#ff7000]/10 border-[#ff7000]/40 text-[#ff7000]"
                  : "bg-[#282828] border-[#383838] text-gray-400 hover:text-gray-200"
              }`}
              title={effects.lockUniformCorners ? "Uniform Corner Radius Locked" : "Individual Corner Radii Unlocked"}
            >
              {effects.lockUniformCorners ? "🔗 Linked" : "🔓 Unlinked"}
            </button>
          </div>

          {/* Corner Rounding Radius */}
          {effects.lockUniformCorners ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-gray-300 font-medium text-xs">
                <span className="truncate pr-1">Corner Rounding</span>
                <span className="bg-[#181818] border border-[#2c2c2c] text-gray-200 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md min-w-[42px] text-center">
                  {effects.borderRadius}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={effects.borderRadius}
                onChange={(e) => handleUniformRadiusChange(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-[#2c2c2c] rounded appearance-none cursor-pointer accent-[#ff7000]"
              />
            </div>
          ) : (
            /* Individual Corner Radius Grid (TL, TR, BR, BL) */
            <div className="space-y-2">
              <span className="text-gray-300 font-medium text-xs block">Individual Corners (px)</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <div className="bg-[#242424] border border-[#333333] rounded p-1 flex items-center justify-between">
                  <span className="text-red-400 font-sans font-bold">TL</span>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={effects.cornerTL}
                    onChange={(e) => updateEffect("cornerTL", Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-12 bg-transparent text-right text-gray-200 focus:outline-none"
                  />
                </div>
                <div className="bg-[#242424] border border-[#333333] rounded p-1 flex items-center justify-between">
                  <span className="text-blue-400 font-sans font-bold">TR</span>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={effects.cornerTR}
                    onChange={(e) => updateEffect("cornerTR", Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-12 bg-transparent text-right text-gray-200 focus:outline-none"
                  />
                </div>
                <div className="bg-[#242424] border border-[#333333] rounded p-1 flex items-center justify-between">
                  <span className="text-amber-400 font-sans font-bold">BL</span>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={effects.cornerBL}
                    onChange={(e) => updateEffect("cornerBL", Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-12 bg-transparent text-right text-gray-200 focus:outline-none"
                  />
                </div>
                <div className="bg-[#242424] border border-[#333333] rounded p-1 flex items-center justify-between">
                  <span className="text-emerald-400 font-sans font-bold">BR</span>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={effects.cornerBR}
                    onChange={(e) => updateEffect("cornerBR", Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-12 bg-transparent text-right text-gray-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Device Sensor Cutout */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-medium text-xs block truncate" title="Device Sensor Cutout">
              Device Sensor Cutout
            </label>
            <select
              value={effects.notchStyle}
              onChange={(e) => updateEffect("notchStyle", e.target.value as NotchStyle)}
              className="w-full bg-[#2a2a2a] border border-[#383838] text-gray-200 font-medium rounded-md px-2.5 py-1.5 focus:outline-none cursor-pointer text-xs"
            >
              <option value="none">None (Standard Screen)</option>
              <option value="macbook-notch">MacBook Notch</option>
              <option value="dynamic-island">iPhone Dynamic Island</option>
              <option value="punch-hole">Camera Punch Hole</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: 3D CURVED SURFACE SMART OBJECT WARPING */}
        <div className="pt-3 border-t border-[#2c2c2c] space-y-3">
          <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            3D CURVED SURFACE SMART OBJECT
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium text-xs block">Surface Curvature Type</label>
            <div className="grid grid-cols-3 gap-1 bg-[#252525] p-0.5 rounded-md border border-[#383838]">
              <button
                type="button"
                onClick={() => updateCurvedSurface("surfaceType", "flat")}
                className={`py-1 rounded text-[11px] font-semibold transition-all ${
                  effects.curvedSurface.surfaceType === "flat"
                    ? "bg-[#ff7000] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Flat 2D
              </button>
              <button
                type="button"
                onClick={() => updateCurvedSurface("surfaceType", "cylinder")}
                className={`py-1 rounded text-[11px] font-semibold transition-all ${
                  effects.curvedSurface.surfaceType === "cylinder"
                    ? "bg-[#ff7000] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                title="Cylindrical warp (Jar, Bottle, Can, Mug)"
              >
                Cylinder
              </button>
              <button
                type="button"
                onClick={() => updateCurvedSurface("surfaceType", "arc")}
                className={`py-1 rounded text-[11px] font-semibold transition-all ${
                  effects.curvedSurface.surfaceType === "arc"
                    ? "bg-[#ff7000] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                title="Spherical Arc surface warp"
              >
                Arc
              </button>
            </div>
          </div>

          {effects.curvedSurface.surfaceType !== "flat" && (
            <>
              {/* Curvature Depth Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-gray-300 font-medium text-xs">
                  <span>Curvature Intensity</span>
                  <span className="bg-[#181818] border border-[#2c2c2c] text-[#ff7000] text-[11px] font-mono font-medium px-2 py-0.5 rounded-md min-w-[42px] text-center">
                    {Math.round(effects.curvedSurface.curvature * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={effects.curvedSurface.curvature}
                  onChange={(e) => updateCurvedSurface("curvature", parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#2c2c2c] rounded appearance-none cursor-pointer accent-[#ff7000]"
                />
              </div>

              {/* Axis Orientation Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Curve Axis</span>
                <div className="flex items-center bg-[#252525] p-0.5 rounded-md border border-[#383838]">
                  <button
                    type="button"
                    onClick={() => updateCurvedSurface("curveAxis", "horizontal")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      effects.curvedSurface.curveAxis === "horizontal"
                        ? "bg-[#383838] text-white"
                        : "text-gray-400"
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurvedSurface("curveAxis", "vertical")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      effects.curvedSurface.curveAxis === "vertical"
                        ? "bg-[#383838] text-white"
                        : "text-gray-400"
                    }`}
                  >
                    Vertical
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SECTION 4: 3D PHYSICS & SMART AI LIGHTING ASSISTANT */}
        <div className="pt-3 border-t border-[#2c2c2c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              3D PHYSICS & LIGHTING
            </div>
            {hasScene && onAutoDetectLighting && (
              <button
                type="button"
                onClick={onAutoDetectLighting}
                className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all"
                title="AI Environment Shadow & Reflection Auto-Detector"
              >
                ✨ AI Auto-Tune
              </button>
            )}
          </div>

          {/* Glass Glare Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-gray-300 font-medium text-xs">
              <span className="truncate pr-1" title="3D Glass Reflection">3D Glass Reflection</span>
              <span className="bg-[#181818] border border-[#2c2c2c] text-gray-200 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md min-w-[42px] text-center">
                {Math.round(effects.glareIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effects.glareIntensity}
              onChange={(e) => updateEffect("glareIntensity", parseFloat(e.target.value))}
              className="w-full h-1 bg-[#2c2c2c] rounded appearance-none cursor-pointer accent-[#ff7000]"
            />
          </div>

          {/* Reflection Angle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-gray-300 font-medium text-xs">
              <span className="truncate pr-1">Reflection Angle</span>
              <span className="bg-[#181818] border border-[#2c2c2c] text-gray-200 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md min-w-[42px] text-center">
                {effects.glareAngle}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={effects.glareAngle}
              onChange={(e) => updateEffect("glareAngle", parseInt(e.target.value, 10))}
              className="w-full h-1 bg-[#2c2c2c] rounded appearance-none cursor-pointer accent-[#ff7000]"
            />
          </div>

          {/* Bevel Shadow */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-gray-300 font-medium text-xs">
              <span className="truncate pr-1" title="Bevel Inner Shadow">Bevel Inner Shadow</span>
              <span className="bg-[#181818] border border-[#2c2c2c] text-gray-200 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md min-w-[42px] text-center">
                {Math.round(effects.innerShadow * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effects.innerShadow}
              onChange={(e) => updateEffect("innerShadow", parseFloat(e.target.value))}
              className="w-full h-1 bg-[#2c2c2c] rounded appearance-none cursor-pointer accent-[#ff7000]"
            />
          </div>
        </div>

        {/* SECTION 5: EXPORT STUDIO */}
        <div className="pt-3 border-t border-[#2c2c2c] space-y-3">
          <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            EXPORT STUDIO
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-xs font-medium">Image Format</label>
              <div className="flex items-center bg-[#252525] p-0.5 rounded-md border border-[#383838]">
                <button
                  type="button"
                  onClick={() => onFormatChange("png")}
                  className={`px-3 py-0.5 rounded text-xs font-bold transition-all ${
                    exportFormat === "png"
                      ? "bg-[#ff7000] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => onFormatChange("jpg")}
                  className={`px-3 py-0.5 rounded text-xs font-bold transition-all ${
                    exportFormat === "jpg"
                      ? "bg-[#ff7000] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  JPG
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 text-xs font-medium block">Target Resolution</label>
              <select
                value={typeof exportResolution === "string" ? exportResolution : "4k"}
                onChange={(e) => onResolutionChange(e.target.value as ExportResolution)}
                className="w-full bg-[#2a2a2a] border border-[#383838] text-gray-200 font-medium rounded-md px-2.5 py-1.5 focus:outline-none cursor-pointer text-xs"
              >
                <option value="4k">4K Extreme (3840px)</option>
                <option value="2k">2K Ultra HD (2560px)</option>
                <option value="1k">1K HD (1920px)</option>
                <option value="original">Original Image Size</option>
              </select>
            </div>

            <button
              onClick={() => onDownload(exportFormat, exportResolution)}
              disabled={!hasScene || !hasUi}
              type="button"
              className="w-full py-2.5 rounded-lg bg-[#ff7000] hover:bg-[#ff801a] disabled:opacity-40 text-white font-semibold transition-all shadow-lg shadow-[#ff7000]/20 flex items-center justify-center gap-2 text-xs mt-2 cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Export High-Res Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
