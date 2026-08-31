import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  Eye, 
  Sparkles, 
  Flame, 
  Activity, 
  Maximize2,
  Info
} from 'lucide-react';
import { TamperBoundingBox, DocumentField } from '../types';
import { generateELACanvas, generateNoiseResidualMap } from '../utils/forensicsEngine';

interface ForensicImageViewerProps {
  documentImageUrl: string;
  tamperBoxes?: TamperBoundingBox[];
  fields?: DocumentField[];
  isTampered?: boolean;
}

type LayerMode = 'original' | 'ela' | 'noise' | 'ocr_boxes';

export const ForensicImageViewer: React.FC<ForensicImageViewerProps> = ({
  documentImageUrl,
  tamperBoxes = [],
  fields = [],
  isTampered = false,
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('original');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBox, setSelectedBox] = useState<TamperBoundingBox | null>(null);
  const [elaImageUrl, setElaImageUrl] = useState<string>('');
  const [noiseImageUrl, setNoiseImageUrl] = useState<string>('');
  const [isGeneratingForensics, setIsGeneratingForensics] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute live ELA & Noise maps whenever documentImageUrl changes
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingForensics(true);

    const runForensicPipeline = async () => {
      try {
        const { elaDataUrl } = await generateELACanvas(documentImageUrl, 28);
        if (isMounted) {
          setElaImageUrl(elaDataUrl);
        }
      } catch (e) {
        console.error('ELA generation error:', e);
      }

      try {
        const noiseUrl = generateNoiseResidualMap(800, 540, tamperBoxes);
        if (isMounted) {
          setNoiseImageUrl(noiseUrl);
        }
      } catch (e) {
        console.error('Noise map error:', e);
      }

      if (isMounted) {
        setIsGeneratingForensics(false);
      }
    };

    runForensicPipeline();

    return () => {
      isMounted = false;
    };
  }, [documentImageUrl, tamperBoxes]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedBox(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Forensic Toolbar */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Forensic Inspector:
          </span>
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setActiveLayer('original')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeLayer === 'original'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Original &amp; Anomaly Overlay
            </button>
            <button
              onClick={() => setActiveLayer('ela')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeLayer === 'ela'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Error Level Analysis (ELA)
            </button>
            <button
              onClick={() => setActiveLayer('noise')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeLayer === 'noise'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Noise Gradient Residual
            </button>
            <button
              onClick={() => setActiveLayer('ocr_boxes')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeLayer === 'ocr_boxes'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              OCR Field Alignment
            </button>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-2 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset View"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition border-l border-slate-800 pl-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-[420px] md:h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* Background Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Active Layer View */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          {/* Base Layer / ELA / Noise */}
          <div className="relative rounded-lg shadow-2xl overflow-hidden border border-slate-700/80">
            {activeLayer === 'original' || activeLayer === 'ocr_boxes' ? (
              <img
                src={documentImageUrl}
                alt="Document Under Examination"
                className="max-h-[380px] md:max-h-[440px] w-auto object-contain block pointer-events-none"
              />
            ) : activeLayer === 'ela' ? (
              <div className="relative">
                {elaImageUrl ? (
                  <img
                    src={elaImageUrl}
                    alt="Error Level Analysis Heatmap"
                    className="max-h-[380px] md:max-h-[440px] w-auto object-contain block pointer-events-none filter contrast-125"
                  />
                ) : (
                  <div className="w-[600px] h-[400px] flex items-center justify-center text-amber-400 bg-slate-950">
                    Computing JPEG Error Level Heatmap...
                  </div>
                )}
                {/* ELA legend badge */}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-amber-500/40 rounded-lg px-3 py-1.5 text-[11px] text-amber-300 font-mono shadow-lg flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  Bright fluorescent clusters = JPEG Compression Anomaly (Splicing)
                </div>
              </div>
            ) : (
              <div className="relative">
                {noiseImageUrl ? (
                  <img
                    src={noiseImageUrl}
                    alt="Noise Residual Map"
                    className="max-h-[380px] md:max-h-[440px] w-auto object-contain block pointer-events-none"
                  />
                ) : (
                  <div className="w-[600px] h-[400px] flex items-center justify-center text-purple-400 bg-slate-950">
                    Calculating High-Frequency Noise Gradients...
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-purple-500/40 rounded-lg px-3 py-1.5 text-[11px] text-purple-300 font-mono shadow-lg flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                  Discontinuity zones highlight edited pixel clusters
                </div>
              </div>
            )}

            {/* Overlaid Tampering Bounding Boxes (Active in 'original' mode) */}
            {(activeLayer === 'original' || activeLayer === 'ela') &&
              tamperBoxes.map((box) => {
                const isSelected = selectedBox?.id === box.id;
                const isHigh = box.severity === 'HIGH' || box.severity === 'CRITICAL';
                return (
                  <div
                    key={box.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBox(isSelected ? null : box);
                    }}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute rounded cursor-pointer transition-all duration-200 group ${
                      isSelected
                        ? 'border-2 border-red-400 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.7)] ring-2 ring-red-400'
                        : isHigh
                        ? 'border-2 border-red-500/90 bg-red-500/20 hover:bg-red-500/30 animate-pulse'
                        : 'border-2 border-amber-500/90 bg-amber-500/20 hover:bg-amber-500/30'
                    }`}
                  >
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-xs" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-xs" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-xs" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-400 rounded-xs" />

                    {/* Tag Badge */}
                    <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap z-20">
                      <AlertTriangle className="w-3 h-3 text-amber-300" />
                      {box.label} ({box.confidence}%)
                    </div>
                  </div>
                );
              })}

            {/* OCR Bounding Boxes (Active in 'ocr_boxes' mode) */}
            {activeLayer === 'ocr_boxes' &&
              fields.map((field) => (
                <div
                  key={field.key}
                  className={`absolute border border-dashed rounded text-[9px] font-mono px-1 py-0.5 pointer-events-none transition ${
                    field.isTampered
                      ? 'border-red-500 bg-red-500/20 text-red-200'
                      : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                  }`}
                  style={{
                    left: `${field.boundingBox?.x || 30}%`,
                    top: `${field.boundingBox?.y || 25}%`,
                    width: `${field.boundingBox?.width || 35}%`,
                    height: `${field.boundingBox?.height || 6}%`,
                  }}
                >
                  <span className="font-bold">{field.label}:</span> {field.value}
                </div>
              ))}
          </div>
        </div>

        {/* Selected Tampering Anomaly Drawer */}
        {selectedBox && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-950/95 border border-red-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500/20 rounded-lg border border-red-500/40 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Forensic Anomaly Detected
                  </h4>
                  <p className="text-sm font-semibold text-white">{selectedBox.label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBox(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">{selectedBox.description}</p>
            {selectedBox.technicalDetails && (
              <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-[11px] font-mono text-cyan-300">
                <span className="text-slate-400 font-bold block mb-0.5">Spectral / Pixel Metrics:</span>
                {selectedBox.technicalDetails}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isTampered ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            Integrity Status: <strong className={isTampered ? 'text-red-400' : 'text-emerald-400'}>{isTampered ? 'TAMPERING DETECTED' : 'UNALTERED / GENUINE'}</strong>
          </span>
          <span>
            Anomalies Located: <strong className="text-white">{tamperBoxes.length}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          Click any highlighted anomaly box to inspect microscopic forensic metrics.
        </div>
      </div>
    </div>
  );
};
