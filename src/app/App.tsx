import React, { useState, useRef } from "react";
import FigmaHeader, { StudioTool } from "../components/figma/FigmaHeader";
import FigmaLeftSidebar from "../components/figma/FigmaLeftSidebar";
import FigmaRightInspector from "../components/figma/FigmaRightInspector";
import FigmaCanvasWorkspace from "../components/figma/FigmaCanvasWorkspace";
import AboutModal from "../components/AboutModal";
import { SceneViewerRef } from "../components/SceneViewer";
import { Quadrilateral, ScreenEffects, DEFAULT_SCREEN_EFFECTS } from "../types/geometry";
import { analyzeEnvironmentLighting } from "../engine/homography";
import { exportCanvas, ExportFormat, ExportResolution } from "../utils/exportCanvas";

export default function App() {
  const [sceneImage, setSceneImage] = useState<HTMLImageElement | null>(null);
  const [sceneFile, setSceneFile] = useState<File | null>(null);
  const [uiImage, setUiImage] = useState<HTMLImageElement | null>(null);
  const [uiFile, setUiFile] = useState<File | null>(null);
  const [quad, setQuad] = useState<Quadrilateral | null>(null);
  const [effects, setEffects] = useState<ScreenEffects>(DEFAULT_SCREEN_EFFECTS);

  const [showHandles, setShowHandles] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<StudioTool>("move");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportResolution, setExportResolution] = useState<ExportResolution>("4k");
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  const viewerRef = useRef<SceneViewerRef>(null);

  const handleSceneLoaded = (img: HTMLImageElement, file: File) => {
    setSceneImage(img);
    setSceneFile(file);

    const w = img.naturalWidth || img.width || 800;
    const h = img.naturalHeight || img.height || 600;

    // Set default quad inset by 20%
    setQuad([
      { x: Math.round(w * 0.2), y: Math.round(h * 0.2) },
      { x: Math.round(w * 0.8), y: Math.round(h * 0.2) },
      { x: Math.round(w * 0.8), y: Math.round(h * 0.8) },
      { x: Math.round(w * 0.2), y: Math.round(h * 0.8) },
    ]);
  };

  const handleUiLoaded = (img: HTMLImageElement, file: File) => {
    setUiImage(img);
    setUiFile(file);
  };

  const handleResetQuad = () => {
    if (!sceneImage) return;
    const w = sceneImage.naturalWidth || sceneImage.width || 800;
    const h = sceneImage.naturalHeight || sceneImage.height || 600;

    setQuad([
      { x: Math.round(w * 0.2), y: Math.round(h * 0.2) },
      { x: Math.round(w * 0.8), y: Math.round(h * 0.2) },
      { x: Math.round(w * 0.8), y: Math.round(h * 0.8) },
      { x: Math.round(w * 0.2), y: Math.round(h * 0.8) },
    ]);
  };

  const handleFitScreenQuad = () => {
    if (!sceneImage) return;
    const w = sceneImage.naturalWidth || sceneImage.width || 800;
    const h = sceneImage.naturalHeight || sceneImage.height || 600;

    setQuad([
      { x: Math.round(w * 0.05), y: Math.round(h * 0.05) },
      { x: Math.round(w * 0.95), y: Math.round(h * 0.05) },
      { x: Math.round(w * 0.95), y: Math.round(h * 0.95) },
      { x: Math.round(w * 0.05), y: Math.round(h * 0.95) },
    ]);
  };

  // Smart AI Environment Shadow & Reflection Recognition
  const handleAutoDetectLighting = () => {
    if (!sceneImage) return;
    const result = analyzeEnvironmentLighting(sceneImage);
    setEffects((prev) => ({
      ...prev,
      glareAngle: result.detectedAngle,
      glareIntensity: result.detectedGlare,
      innerShadow: result.detectedShadow,
    }));
  };

  // Demo sample generator
  const handleLoadSample = () => {
    // 1. Generate Sample Scene (Laptop screen on desk)
    const sceneCanvas = document.createElement("canvas");
    sceneCanvas.width = 1000;
    sceneCanvas.height = 700;
    const sCtx = sceneCanvas.getContext("2d")!;

    const bgGradient = sCtx.createLinearGradient(0, 0, 1000, 700);
    bgGradient.addColorStop(0, "#1e293b");
    bgGradient.addColorStop(1, "#0f172a");
    sCtx.fillStyle = bgGradient;
    sCtx.fillRect(0, 0, 1000, 700);

    sCtx.fillStyle = "#334155";
    sCtx.fillRect(0, 500, 1000, 200);

    sCtx.fillStyle = "#64748b";
    sCtx.beginPath();
    sCtx.moveTo(100, 540);
    sCtx.lineTo(900, 540);
    sCtx.lineTo(950, 620);
    sCtx.lineTo(50, 620);
    sCtx.closePath();
    sCtx.fill();

    sCtx.fillStyle = "#090d16";
    sCtx.beginPath();
    sCtx.moveTo(170, 100);
    sCtx.lineTo(830, 70);
    sCtx.lineTo(870, 540);
    sCtx.lineTo(130, 540);
    sCtx.closePath();
    sCtx.fill();

    sCtx.fillStyle = "#1e1e2e";
    sCtx.beginPath();
    sCtx.moveTo(200, 130);
    sCtx.lineTo(800, 100);
    sCtx.lineTo(840, 510);
    sCtx.lineTo(160, 510);
    sCtx.closePath();
    sCtx.fill();

    const sceneImg = new Image();
    sceneImg.onload = () => {
      setSceneImage(sceneImg);
      const dummyFile = new File([], "demo-laptop-scene.png", { type: "image/png" });
      setSceneFile(dummyFile);

      setQuad([
        { x: 200, y: 130 }, // TL
        { x: 800, y: 100 }, // TR
        { x: 840, y: 510 }, // BR
        { x: 160, y: 510 }, // BL
      ]);

      setEffects({
        ...DEFAULT_SCREEN_EFFECTS,
        borderRadius: 20,
        cornerTL: 20,
        cornerTR: 20,
        cornerBR: 20,
        cornerBL: 20,
        glareIntensity: 0.35,
        glareAngle: 45,
        innerShadow: 0.3,
        notchStyle: "macbook-notch",
      });
    };
    sceneImg.src = sceneCanvas.toDataURL();

    // 2. Generate Sample UI Artwork
    const uiCanvas = document.createElement("canvas");
    uiCanvas.width = 800;
    uiCanvas.height = 500;
    const uCtx = uiCanvas.getContext("2d")!;

    uCtx.fillStyle = "#0f172a";
    uCtx.fillRect(0, 0, 800, 500);

    uCtx.fillStyle = "#1e293b";
    uCtx.fillRect(0, 0, 200, 500);

    uCtx.fillStyle = "#ff7000";
    uCtx.fillRect(20, 30, 160, 40);
    uCtx.fillStyle = "#94a3b8";
    uCtx.fillRect(20, 100, 140, 20);
    uCtx.fillRect(20, 140, 120, 20);
    uCtx.fillRect(20, 180, 150, 20);

    const colors = ["#ff7000", "#06b6d4", "#10b981"];
    colors.forEach((c, idx) => {
      uCtx.fillStyle = c;
      uCtx.fillRect(230 + idx * 180, 40, 160, 100);

      uCtx.fillStyle = "rgba(255,255,255,0.8)";
      uCtx.fillRect(250 + idx * 180, 60, 80, 12);
      uCtx.fillRect(250 + idx * 180, 85, 120, 24);
    });

    uCtx.fillStyle = "#1e293b";
    uCtx.fillRect(230, 170, 530, 290);

    uCtx.strokeStyle = "#ff7000";
    uCtx.lineWidth = 4;
    uCtx.beginPath();
    uCtx.moveTo(250, 400);
    uCtx.bezierCurveTo(350, 250, 450, 420, 550, 300);
    uCtx.bezierCurveTo(600, 240, 700, 350, 730, 260);
    uCtx.stroke();

    uCtx.fillStyle = "#ffffff";
    uCtx.font = "bold 20px Inter, sans-serif";
    uCtx.fillText("Analytics Dashboard Pro", 250, 210);

    const uiImg = new Image();
    uiImg.onload = () => {
      setUiImage(uiImg);
      const dummyUiFile = new File([], "demo-ui-artwork.png", { type: "image/png" });
      setUiFile(dummyUiFile);
    };
    uiImg.src = uiCanvas.toDataURL();
  };

  const handleDownload = (format: ExportFormat = "png", resolution: ExportResolution = "4k") => {
    const previewCanvas = viewerRef.current?.getCanvas();

    exportCanvas({
      sourceCanvas: previewCanvas,
      sceneImage,
      uiImage,
      quad,
      effects,
      format,
      resolution,
      filename: "mockforge-3d-perspective-mockup",
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#141414] overflow-hidden select-none font-['Inter',sans-serif]">
      {/* Top Bar: Figma Header */}
      <FigmaHeader
        showHandles={showHandles}
        onToggleHandles={() => setShowHandles(!showHandles)}
        onLoadSample={handleLoadSample}
        onDownload={handleDownload}
        exportFormat={exportFormat}
        onFormatChange={setExportFormat}
        exportResolution={exportResolution}
        onResolutionChange={setExportResolution}
        hasScene={!!sceneImage}
        hasUi={!!uiImage}
        zoomLevel={zoomLevel}
        onResetZoom={() => setZoomLevel(1.0)}
        sceneFileName={sceneFile?.name}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Studio Area (3-Column Figma Layout) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Layers & Upload Assets */}
        <FigmaLeftSidebar
          sceneFile={sceneFile}
          uiFile={uiFile}
          quad={quad}
          onSceneLoaded={handleSceneLoaded}
          onUiLoaded={handleUiLoaded}
          onResetQuad={handleResetQuad}
          hasScene={!!sceneImage}
          hasUi={!!uiImage}
        />

        {/* Center: Interactive Viewport Workspace */}
        <FigmaCanvasWorkspace
          sceneImage={sceneImage}
          uiImage={uiImage}
          quad={quad}
          effects={effects}
          onQuadChange={setQuad}
          viewerRef={viewerRef}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onSceneLoaded={handleSceneLoaded}
          onUiLoaded={handleUiLoaded}
          activeTool={activeTool}
          showHandles={showHandles}
        />

        {/* Right Panel: Figma Design Inspector */}
        <FigmaRightInspector
          effects={effects}
          onChangeEffects={setEffects}
          exportFormat={exportFormat}
          onFormatChange={setExportFormat}
          exportResolution={exportResolution}
          onResolutionChange={setExportResolution}
          onDownload={handleDownload}
          onResetQuad={handleResetQuad}
          onFitScreen={handleFitScreenQuad}
          hasScene={!!sceneImage}
          hasUi={!!uiImage}
          onAutoDetectLighting={handleAutoDetectLighting}
        />
      </div>

      {/* Creator Info & About Author Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
