import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Telescope, Sliders, Layers, Palette, Eye, Sparkles } from 'lucide-react';

const DETECTORS = [
  { id: 1, name: 'Detector 1', range: '0.75 - 1.11 µm', side: 'SWIR', r: 41, startIdx: 0, endIdx: 17 },
  { id: 2, name: 'Detector 2', range: '1.11 - 1.64 µm', side: 'SWIR', r: 41, startIdx: 17, endIdx: 34 },
  { id: 3, name: 'Detector 3', range: '1.64 - 2.42 µm', side: 'SWIR', r: 41, startIdx: 34, endIdx: 51 },
  { id: 4, name: 'Detector 4', range: '2.40 - 3.82 µm', side: 'MWIR', r: 135, startIdx: 51, endIdx: 68 },
  { id: 5, name: 'Detector 5', range: '3.82 - 4.42 µm', side: 'MWIR', r: 128, startIdx: 68, endIdx: 85 },
  { id: 6, name: 'Detector 6', range: '4.42 - 5.01 µm', side: 'MWIR', r: 130, startIdx: 85, endIdx: 102 },
];

const CHANNELS = Array.from({ length: 102 }, (_, i) => {
  const wl = 0.75 + (i / 101) * (5.01 - 0.75);
  const detector = DETECTORS.find(d => i >= d.startIdx && i < d.endIdx) || DETECTORS[5];
  return {
    number: i + 1,
    wavelength: wl.toFixed(2),
    detectorId: detector.id,
    detectorName: detector.name,
    side: detector.side,
  };
});

export default function App() {
  const [currentChannel, setCurrentChannel] = useState(54);
  const [displayMode, setDisplayMode] = useState('single');
  const [selectedDetectorCoadd, setSelectedDetectorCoadd] = useState(1);
  const [rgbChannels, setRgbChannels] = useState({ red: 90, green: 45, blue: 10 });

  const canvasRef = useRef(null);

  const spectralCube = useMemo(() => {
    const size = 64;
    const cube = [];
    for (let c = 0; c < 102; c++) {
      const channelData = Float32Array.from({ length: size * size }, (_, idx) => {
        const x = idx % size;
        const y = Math.floor(idx / size);
        let flux = Math.random() * 0.05;

        const distStar1 = Math.hypot(x - 20, y - 20);
        if (distStar1 < 3) {
          const thermalFactor = Math.max(0.1, 1 - (c / 102) * 0.8);
          flux += Math.exp(-distStar1 * distStar1 / 1.5) * 8.0 * thermalFactor;
        }

        const distBrownDwarf = Math.hypot(x - 45, y - 42);
        if (distBrownDwarf < 3.5) {
          const methaneAbsorptionWindow = c > 75 ? Math.pow((c - 75) / 27, 1.5) * 12.0 : 0.02;
          flux += Math.exp(-distBrownDwarf * distBrownDwarf / 1.8) * methaneAbsorptionWindow;
        }

        return flux;
      });
      cube.push(channelData);
    }
    return cube;
  }, []);

  const detectorCoadds = useMemo(() => {
    const coadds = {};
    DETECTORS.forEach(det => {
      const size = 64;
      const coaddBuffer = new Float32Array(size * size);
      const count = det.endIdx - det.startIdx;

      for (let c = det.startIdx; c < det.endIdx; c++) {
        const chData = spectralCube[c];
        for (let i = 0; i < chData.length; i++) {
          coaddBuffer[i] += chData[i];
        }
      }
      for (let i = 0; i < coaddBuffer.length; i++) {
        coaddBuffer[i] /= count;
      }
      coadds[det.id] = coaddBuffer;
    });
    return coadds;
  }, [spectralCube]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 64;
    const imgData = ctx.createImageData(size, size);

    if (displayMode === 'single') {
      const activeData = spectralCube[currentChannel - 1];
      if (activeData) {
        for (let i = 0; i < size * size; i++) {
          const val = Math.min(255, Math.floor(activeData[i] * 30));
          const idx = i * 4;
          imgData.data[idx] = val;
          imgData.data[idx + 1] = val > 128 ? (val - 128) * 2 : 0;
          imgData.data[idx + 2] = 255 - val;
          imgData.data[idx + 3] = 255;
        }
      }
    } else if (displayMode === 'coadd') {
      const activeData = detectorCoadds[selectedDetectorCoadd];
      if (activeData) {
        for (let i = 0; i < size * size; i++) {
          const val = Math.min(255, Math.floor(activeData[i] * 30));
          const idx = i * 4;
          imgData.data[idx] = val;
          imgData.data[idx + 1] = val > 128 ? (val - 128) * 2 : 0;
          imgData.data[idx + 2] = 255 - val;
          imgData.data[idx + 3] = 255;
        }
      }
    } else if (displayMode === 'rgb') {
      const rData = spectralCube[rgbChannels.red - 1];
      const gData = spectralCube[rgbChannels.green - 1];
      const bData = spectralCube[rgbChannels.blue - 1];

      if (rData && gData && bData) {
        for (let i = 0; i < size * size; i++) {
          const r = Math.min(255, Math.floor(rData[i] * 35));
          const g = Math.min(255, Math.floor(gData[i] * 35));
          const b = Math.min(255, Math.floor(bData[i] * 35));

          const idx = i * 4;
          imgData.data[idx] = r;
          imgData.data[idx + 1] = g;
          imgData.data[idx + 2] = b;
          imgData.data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [currentChannel, displayMode, selectedDetectorCoadd, rgbChannels, spectralCube, detectorCoadds]);

  const activeChanObj = CHANNELS[currentChannel - 1] || CHANNELS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Telescope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-cyan-400 flex items-center gap-2">
              SPHEREx <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">102-Channel Cube Navigator</span>
            </h1>
            <p className="text-sm text-slate-400">NASA Space Apps Challenge — Undersampled PSF (6.15″/px) Spectral Viewer</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-sm">
          <button 
            onClick={() => setDisplayMode('single')} 
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${displayMode === 'single' ? 'bg-cyan-600 text-white font-medium shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <Sliders className="w-4 h-4" /> Single Channel
          </button>
          <button 
            onClick={() => setDisplayMode('coadd')} 
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${displayMode === 'coadd' ? 'bg-cyan-600 text-white font-medium shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <Layers className="w-4 h-4" /> Detector Coadd
          </button>
          <button 
            onClick={() => setDisplayMode('rgb')} 
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${displayMode === 'rgb' ? 'bg-cyan-600 text-white font-medium shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <Palette className="w-4 h-4" /> RGB Mixer
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center shadow-xl relative overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>PSF Scale: 6.15″/px (Undersampled)</span>
            </div>

            <div className="my-6 p-3 bg-black rounded-xl border border-slate-800 shadow-inner">
              <canvas 
                ref={canvasRef} 
                width={64} 
                height={64} 
                style={{ width: '280px', height: '280px', imageRendering: 'pixelated' }}
                className="rounded shadow-2xl"
              />
            </div>

            <div className="w-full bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-wrap justify-between items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Active Detector</span>
                <span className="font-semibold text-cyan-400">{activeChanObj.detectorName} ({activeChanObj.side})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Wavelength (λ)</span>
                <span className="font-semibold text-emerald-400">{activeChanObj.wavelength} µm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Resolving Power</span>
                <span className="font-semibold text-purple-400">R ~ {activeChanObj.side === 'SWIR' ? '41' : '130'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Channel Index</span>
                <span className="font-semibold text-amber-400">Chan {activeChanObj.number} / 102</span>
              </div>
            </div>
          </div>

          {displayMode === 'single' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> 102-Channel Wavelength Scrubber
                </h3>
                <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">
                  {activeChanObj.wavelength} µm
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="102" 
                value={currentChannel}
                onChange={(e) => setCurrentChannel(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0.75 µm (Chan 1)</span>
                <span>2.42 µm (Chan 51)</span>
                <span>5.01 µm (Chan 102)</span>
              </div>
            </div>
          )}

          {displayMode === 'coadd' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Detector Coadd Selector (Averages ~17 Channels)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DETECTORS.map(det => (
                  <button
                    key={det.id}
                    onClick={() => setSelectedDetectorCoadd(det.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${selectedDetectorCoadd === det.id ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <span className="font-bold text-xs">{det.name}</span>
                    <span className="text-[11px] text-slate-400">{det.range}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {displayMode === 'rgb' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" /> False-Color RGB Mixer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-red-900/50 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-red-400">Red Channel: {rgbChannels.red}</label>
                  <input type="range" min="1" max="102" value={rgbChannels.red} onChange={e => setRgbChannels({...rgbChannels, red: Number(e.target.value)})} className="accent-red-500" />
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-green-900/50 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-green-400">Green Channel: {rgbChannels.green}</label>
                  <input type="range" min="1" max="102" value={rgbChannels.green} onChange={e => setRgbChannels({...rgbChannels, green: Number(e.target.value)})} className="accent-green-500" />
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-blue-900/50 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-blue-400">Blue Channel: {rgbChannels.blue}</label>
                  <input type="range" min="1" max="102" value={rgbChannels.blue} onChange={e => setRgbChannels({...rgbChannels, blue: Number(e.target.value)})} className="accent-blue-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-5 h-5 text-cyan-400" /> SPHEREx Focal Plane Arrays
          </h3>

          <div className="flex flex-col gap-3">
            {DETECTORS.map(det => (
              <div key={det.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs text-slate-200">{det.name}</span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">{det.side}</span>
                </div>
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>{det.range}</span>
                  <span className="text-purple-400 font-mono">R ~ {det.r}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 text-xs text-cyan-300 leading-relaxed">
            <span className="font-bold block mb-1">💡 Hackathon Pitch Tip:</span>
            Scrubbing between Channels 1–51 (SWIR) and 54–102 (MWIR) highlights how cold objects like brown dwarfs flash into view as methane absorption windows open.
          </div>
        </div>
      </main>
    </div>
  );
}