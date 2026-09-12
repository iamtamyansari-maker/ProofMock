# MockForge Studio — Figma Design System & Specification

This document provides the complete **Figma Design System Specification**, design tokens, and vector layout blueprints for **MockForge Studio**.

---

## 🎨 Design Tokens

### Color Palette
- **App Background**: `#141414` (Dark Studio Workspace)
- **Panels & Sidebars**: `#1e1e1e` (Figma Left Sidebar & Right Inspector)
- **Top Header**: `#2c2c2c` (Figma Header Navigation)
- **Cards & Inputs**: `#252525` / `#2a2a2a`
- **Borders & Dividers**: `#383838` / `#2c2c2c`
- **Primary Accent**: `#6366f1` (Indigo 500)
- **Success Accent**: `#10b981` (Emerald 500)
- **Handle Node Colors**:
  - `TL` (Top-Left): `#ef4444` (Red)
  - `TR` (Top-Right): `#3b82f6` (Blue)
  - `BR` (Bottom-Right): `#10b981` (Green)
  - `BL` (Bottom-Left): `#f59e0b` (Yellow)

### Typography Tokens
- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Font Weights**:
  - `Normal` (400)
  - `Medium` (500)
- **Font Sizes**:
  - `Header Title`: 13px / Medium
  - `Sidebar / Layer Label`: 12px / Medium
  - `Caption / Section Label`: 10px / Uppercase / Tracking-wider
  - `Inspector Input`: 11px / Monospace

---

## 📁 How to Import Vector Blueprint into Figma

1. Open **Figma** (or [Figma Web App](https://figma.com)).
2. Drag and drop [`MockForge-Figma-Blueprint.svg`](file:///d:/Project/MockForge-Figma-Blueprint.svg) directly onto your Figma canvas.
3. Figma will convert all components, layers, header elements, sidebars, and handles into native **Figma Frames & Vector Layers**!
4. Edit colors, typography, or layout in Figma, and send your updated design back anytime!

---

## 🏗️ Figma Component Layout Hierarchy

```
MockForge Studio [Frame: 1440x900]
├── Top Bar [Header Frame: 1440x44]
│   ├── Brand Icon & Title [❖ MockForge Studio]
│   ├── Tool Strip [Move ↖ | Handles On ⤭]
│   ├── Document Title Pill [Perspective_3D_Mockup.png]
│   └── Export Controls [✨ Demo Sample | Format | Resolution | 📥 Export]
│
├── Left Sidebar [Panel Frame: 240x856]
│   ├── Tab Selector [Layers Tree | Upload Assets]
│   ├── Layer Tree [Perspective Quad | UI Artwork | Mockup Scene]
│   └── Coordinate Inspector [TL, TR, BR, BL Coordinates]
│
├── Canvas Workspace [Viewport Frame: 960x856]
│   ├── Dot Grid Background [24px Spacing]
│   ├── Scene Viewer Canvas [Composite Scene + Warped UI]
│   └── Floating Viewport Controls [- | Zoom Preset | + | Fit | 100%]
│
└── Right Inspector [Panel Frame: 240x856]
    ├── Transform & Quad [↺ Reset Quad | ⤢ Fit Screen]
    ├── Screen Framing [Corner Rounding Slider | Device Notch Selector]
    ├── 3D Physics [Glass Reflection Glare | Angle | Inner Shadow]
    └── Export Studio [Format PNG/JPG | Resolution 4K/2K/1K | Export Button]
```
