// src/components/RealismPanel.tsx
import React from "react";
import { ScreenEffects, NotchStyle } from "../types/geometry";

interface RealismPanelProps {
  effects: ScreenEffects;
  onChange: (newEffects: ScreenEffects) => void;
}

export default function RealismPanel({ effects, onChange }: RealismPanelProps) {
  const updateEffect = <K extends keyof ScreenEffects>(key: K, value: ScreenEffects[K]) => {
    onChange({ ...effects, [key]: value });
  };

  return (
    <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm w-full max-w-4xl mb-6">
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>✨ Realism & Physics Effects</span>
          </h3>
          <p className="text-xs text-gray-500">
            Customize 3D glass glare, screen corner rounding, bevel shadows, and device notch cutouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Border Radius (Corner Rounding) */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between font-semibold text-gray-700 mb-1">
            <span>Corner Rounding</span>
            <span className="text-indigo-600 font-bold">{effects.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={effects.borderRadius}
            onChange={(e) => updateEffect("borderRadius", parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Glass Glare Intensity */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between font-semibold text-gray-700 mb-1">
            <span>3D Glass Reflection</span>
            <span className="text-indigo-600 font-bold">{Math.round(effects.glareIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effects.glareIntensity}
            onChange={(e) => updateEffect("glareIntensity", parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Bevel Inner Shadow */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between font-semibold text-gray-700 mb-1">
            <span>Screen Bevel Shadow</span>
            <span className="text-indigo-600 font-bold">{Math.round(effects.innerShadow * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effects.innerShadow}
            onChange={(e) => updateEffect("innerShadow", parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Device Notch Cutout */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
          <div className="font-semibold text-gray-700 mb-1">
            Device Notch Cutout
          </div>
          <select
            value={effects.notchStyle}
            onChange={(e) => updateEffect("notchStyle", e.target.value as NotchStyle)}
            className="w-full text-xs bg-white border border-gray-300 text-gray-800 font-semibold rounded px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="none">None (Standard Screen)</option>
            <option value="macbook-notch">MacBook Notch</option>
            <option value="dynamic-island">iPhone Dynamic Island</option>
            <option value="punch-hole">Camera Punch Hole</option>
          </select>
        </div>
      </div>
    </div>
  );
}
