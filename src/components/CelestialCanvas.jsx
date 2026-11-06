import { useRef, useEffect, useState } from 'react';
import { COLORMAP_LUTS, COLORMAP_OPTIONS } from '../utils/colormaps';
import { CELESTIAL_OBJECTS } from '../data/spherexData';
import { Sparkles, Crosshair } from 'lucide-react';

export default function CelestialCanvas({
  spectralCube,
  detectorCoadds,
  displayMode,
  currentChannel,
  selectedDetectorCoadd,
  rgbChannels,
  selectedObject,
  onSelectObject,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [colormap, setColormap] = useState('inferno');
  const [showPins, setShowPins] = useState(true);
  const [renderMode, setRenderMode] = useState('pixelated'); // 'pixelated' | 'smooth'
  const [hoveredCoords, setHoveredCoords] = useState(null); // { x, y, flux }

  const size = 64;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    if (displayMode === 'single' || displayMode === 'coadd') {
      const activeData =
        displayMode === 'single'
          ? spectralCube[currentChannel - 1]
          : detectorCoadds[selectedDetectorCoadd];

      if (!activeData) return;

      const lut = COLORMAP_LUTS[colormap];

      if (colormap === 'classic' || !lut) {
        // Original colormap preserved
        for (let i = 0; i < size * size; i++) {
          const val = Math.min(255, Math.floor(activeData[i] * 30));
          const idx = i * 4;
          data[idx] = val;
          data[idx + 1] = val > 128 ? (val - 128) * 2 : 0;
          data[idx + 2] = 255 - val;
          data[idx + 3] = 255;
        }
      } else {
        // High-contrast astrophysical LUT colormap
        // Peak flux in simulation is ~12-14
        const scale = 255 / 12;
        for (let i = 0; i < size * size; i++) {
          const flux = activeData[i];
          const val = Math.min(255, Math.max(0, Math.floor(flux * scale)));
          const idx = i * 4;
          data[idx] = lut[val * 3];
          data[idx + 1] = lut[val * 3 + 1];
          data[idx + 2] = lut[val * 3 + 2];
          data[idx + 3] = 255;
        }
      }
    } else if (displayMode === 'rgb') {
      const rData = spectralCube[rgbChannels.red - 1];
      const gData = spectralCube[rgbChannels.green - 1];
      const bData = spectralCube[rgbChannels.blue - 1];

      if (rData && gData && bData) {
        for (let i = 0; i < size * size; i++) {
          // Normalizing color channels with gentle gamma stretch for vibrant deep-space aesthetic
          const r = Math.min(255, Math.floor(Math.pow(Math.min(1, rData[i] / 10), 0.85) * 255));
          const g = Math.min(255, Math.floor(Math.pow(Math.min(1, gData[i] / 10), 0.85) * 255));
          const b = Math.min(255, Math.floor(Math.pow(Math.min(1, bData[i] / 10), 0.85) * 255));

          const idx = i * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [
    spectralCube,
    detectorCoadds,
    displayMode,
    currentChannel,
    selectedDetectorCoadd,
    rgbChannels,
    colormap,
  ]);

  // Handle canvas hover coordinate sampling
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.floor((clientX / rect.width) * size);
    const y = Math.floor((clientY / rect.height) * size);

    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = y * size + x;
      let flux = 0;
      if (displayMode === 'single') {
        flux = spectralCube[currentChannel - 1]?.[idx] || 0;
      } else if (displayMode === 'coadd') {
        flux = detectorCoadds[selectedDetectorCoadd]?.[idx] || 0;
      }
      setHoveredCoords({ x, y, flux: flux.toFixed(2) });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCoords(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top Header Bar inside Viewer */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {displayMode === 'single' && 'Infrared Camera View'}
            {displayMode === 'coadd' && 'Stacked Detector View'}
            {displayMode === 'rgb' && 'False-Color Composite'}
          </span>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowPins(!showPins)}
            title="Toggle clickable star markers"
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
              showPins
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{showPins ? 'Stars Pinned' : 'Hide Pins'}</span>
          </button>

          <button
            onClick={() => setRenderMode(renderMode === 'pixelated' ? 'smooth' : 'pixelated')}
            title="Switch between telescope detector pixels and smoothed glow"
            className="px-2.5 py-1 rounded-lg border bg-slate-950 border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1"
          >
            <span>{renderMode === 'pixelated' ? '⬛ Pixels' : '✨ Smooth'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative my-2 p-3 bg-black/90 rounded-2xl border-2 border-slate-800/80 shadow-[0_0_50px_rgba(6,182,212,0.1)] group select-none"
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{
            width: '320px',
            height: '320px',
            maxWidth: '85vw',
            maxHeight: '85vw',
            imageRendering: renderMode === 'pixelated' ? 'pixelated' : 'auto',
          }}
          className="rounded-xl shadow-2xl block cursor-crosshair transition-all"
        />

        {/* Interactive Star & Brown Dwarf Target Pins */}
        {showPins &&
          CELESTIAL_OBJECTS.map((obj) => {
            const isSelected = selectedObject?.id === obj.id;
            const currentFlux = obj.getExpectedFlux(currentChannel - 1);
            const isVisible = currentFlux > 0.4;

            return (
              <button
                key={obj.id}
                onClick={() => onSelectObject(obj)}
                style={{
                  left: `${obj.pctX}%`,
                  top: `${obj.pctY}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin transition-all duration-300 focus:outline-none`}
              >
                {/* Pulsing Target Ring */}
                <span
                  className={`absolute -inset-2.5 rounded-full border transition-all ${
                    isSelected
                      ? 'border-cyan-400 scale-125 animate-pulse bg-cyan-400/20'
                      : 'border-white/40 hover:border-cyan-300 hover:scale-110'
                  } ${isVisible ? 'opacity-100' : 'opacity-40'}`}
                />

                {/* Center Pin Indicator */}
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform ${
                    obj.id === 'star-alpha'
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300/50'
                      : 'bg-cyan-400 text-slate-950 ring-2 ring-cyan-300/50'
                  } ${isSelected ? 'scale-125' : 'group-hover/pin:scale-110'}`}
                >
                  {obj.id === 'star-alpha' ? '☀️' : '🪐'}
                </div>

                {/* Floating Label Pill */}
                <div
                  className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] font-medium transition-all pointer-events-none shadow-md ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold scale-105'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-700/80 group-hover/pin:border-cyan-400'
                  }`}
                >
                  {obj.simpleTitle}
                  {!isVisible && <span className="ml-1 text-[10px] text-slate-400 font-normal">(Dim)</span>}
                </div>
              </button>
            );
          })}

        {/* Hover Coordinate Crosshair Pill */}
        {hoveredCoords && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/90 text-slate-300 border border-slate-700 text-[11px] px-2.5 py-1 rounded-full shadow-lg backdrop-blur flex items-center gap-2 pointer-events-none">
            <span className="text-cyan-400 font-mono">Pixel ({hoveredCoords.x}, {hoveredCoords.y})</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono">Flux: {hoveredCoords.flux}</span>
          </div>
        )}
      </div>

      {/* Colormap Selector & Quick Note */}
      <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Color Palette:</span>
          <div className="flex gap-1.5">
            {COLORMAP_OPTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColormap(c.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                  colormap === c.id
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-400 text-[11px] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Click any star to inspect its secrets
        </span>
      </div>
    </div>
  );
}
