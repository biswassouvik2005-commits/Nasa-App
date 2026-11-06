import { useState, useEffect } from 'react';
import {
  Telescope,
  Sliders,
  Layers,
  Palette,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

import {
  DETECTORS,
  CHANNELS,
  CELESTIAL_OBJECTS,
  STORIES,
  RGB_PRESETS,
} from './data/spherexData';

import CelestialCanvas from './components/CelestialCanvas';
import SpectrumChart from './components/SpectrumChart';
import ObjectInspector from './components/ObjectInspector';
import StoryGuide from './components/StoryGuide';
import HelpModal from './components/HelpModal';

// Deterministic pseudo-random number generator for reproducible astronomical noise
function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Pre-generate spectral data cube (64x64 x 102 channels)
function generateSpectralCube() {
  const size = 64;
  const cube = [];
  for (let c = 0; c < 102; c++) {
    const channelData = Float32Array.from({ length: size * size }, (_, idx) => {
      const x = idx % size;
      const y = Math.floor(idx / size);
      let flux = pseudoRandom(idx * 7919 + c * 104729) * 0.04;

      // Hot star Alpha at (20, 20)
      const distStar1 = Math.hypot(x - 20, y - 20);
      if (distStar1 < 3) {
        const thermalFactor = Math.max(0.1, 1 - (c / 102) * 0.8);
        flux += Math.exp((-distStar1 * distStar1) / 1.5) * 8.0 * thermalFactor;
      }

      // Cold Brown Dwarf WISE 0855 at (45, 42)
      const distBrownDwarf = Math.hypot(x - 45, y - 42);
      if (distBrownDwarf < 3.5) {
        const methaneAbsorptionWindow =
          c > 75 ? Math.pow((c - 75) / 27, 1.5) * 12.0 : 0.02;
        flux += Math.exp((-distBrownDwarf * distBrownDwarf) / 1.8) * methaneAbsorptionWindow;
      }

      return flux;
    });
    cube.push(channelData);
  }
  return cube;
}

const SPECTRAL_CUBE = generateSpectralCube();

// Pre-compute detector coadds (averaging 17 channels per detector array)
function computeDetectorCoadds(cube) {
  const coadds = {};
  DETECTORS.forEach((det) => {
    const size = 64;
    const coaddBuffer = new Float32Array(size * size);
    const count = det.endIdx - det.startIdx;

    for (let c = det.startIdx; c < det.endIdx; c++) {
      const chData = cube[c];
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
}

const DETECTOR_COADDS = computeDetectorCoadds(SPECTRAL_CUBE);

export default function App() {
  const [currentChannel, setCurrentChannel] = useState(54);
  const [displayMode, setDisplayMode] = useState('single'); // 'single' | 'coadd' | 'rgb'
  const [selectedDetectorCoadd, setSelectedDetectorCoadd] = useState(1);
  const [rgbChannels, setRgbChannels] = useState({ red: 95, green: 52, blue: 14 });

  // User experience states
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [selectedObject, setSelectedObject] = useState(CELESTIAL_OBJECTS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1, 2, 4
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(STORIES[0].id);

  // Autoplay ticker for wavelength scrubber
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(40, 160 / playSpeed);
    const timer = setInterval(() => {
      setCurrentChannel((prev) => {
        if (prev >= 102) {
          return 1;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed]);

  const activeChanObj = CHANNELS[currentChannel - 1] || CHANNELS[0];

  const handleSelectStory = (story) => {
    setActiveStoryId(story.id);
    if (story.channel) setCurrentChannel(story.channel);
    if (story.displayMode) setDisplayMode(story.displayMode);
    if (story.focusObjectId) {
      const targetObj = CELESTIAL_OBJECTS.find((o) => o.id === story.focusObjectId);
      if (targetObj) setSelectedObject(targetObj);
    }
  };

  const handlePrevChannel = () => {
    setCurrentChannel((prev) => Math.max(1, prev - 1));
  };

  const handleNextChannel = () => {
    setCurrentChannel((prev) => Math.min(102, prev + 1));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Help Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 rounded-2xl border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Telescope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                NASA SPHEREx Explorer
              </h1>
              <span className="text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                102 Infrared Bands
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Explore how NASA sees invisible infrared heat and discovers cold hidden worlds
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Beginner / Expert Mode Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setIsSimpleMode(true)}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                isSimpleMode
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🎓 Simple Mode</span>
            </button>
            <button
              onClick={() => setIsSimpleMode(false)}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                !isSimpleMode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🔬 Pro Mode</span>
            </button>
          </div>

          {/* Quick Help Guide Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition text-xs font-medium flex items-center gap-1.5 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>How it Works</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Guided Cosmic Discovery Stories Banner */}
        <StoryGuide onSelectStory={handleSelectStory} activeStoryId={activeStoryId} />

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Visual Telescope Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Interactive Canvas Viewport */}
            <CelestialCanvas
              spectralCube={SPECTRAL_CUBE}
              detectorCoadds={DETECTOR_COADDS}
              displayMode={displayMode}
              currentChannel={currentChannel}
              selectedDetectorCoadd={selectedDetectorCoadd}
              rgbChannels={rgbChannels}
              selectedObject={selectedObject}
              onSelectObject={setSelectedObject}
            />

            {/* Instrument Stats Bar */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-lg">
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {isSimpleMode ? 'Camera Sensor' : 'Active Detector'}
                </span>
                <span className="font-bold text-cyan-400">
                  {isSimpleMode ? activeChanObj.detectorFriendly : activeChanObj.detectorName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Light Wavelength (λ)</span>
                <span className="font-bold text-emerald-400">{activeChanObj.wavelength} µm</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {isSimpleMode ? 'Light Type' : 'Resolving Power'}
                </span>
                <span className="font-bold text-purple-400">
                  {isSimpleMode ? activeChanObj.sideName : `R ~ ${activeChanObj.resolvingPower}`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Infrared Slice</span>
                <span className="font-bold text-amber-400">
                  Chan {activeChanObj.number} <span className="text-slate-400 font-normal">/ 102</span>
                </span>
              </div>
            </div>

            {/* Interactive Spectrum Chart (SED) */}
            <SpectrumChart
              currentChannel={currentChannel}
              onSelectChannel={setCurrentChannel}
              selectedObject={selectedObject}
              isSimpleMode={isSimpleMode}
            />

            {/* Selected Object Inspector */}
            <ObjectInspector
              selectedObject={selectedObject}
              onSelectObject={setSelectedObject}
              currentChannel={currentChannel}
              isSimpleMode={isSimpleMode}
            />
          </div>

          {/* Right Column: Intuitive Exploration Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Mode Switcher Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-col gap-1 shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 px-2 pt-1 uppercase tracking-wider">
                Viewing Mode
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setDisplayMode('single')}
                  className={`p-2.5 rounded-xl transition flex flex-col items-center gap-1 text-center ${
                    displayMode === 'single'
                      ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span className="text-xs">Wavelength</span>
                </button>

                <button
                  onClick={() => setDisplayMode('coadd')}
                  className={`p-2.5 rounded-xl transition flex flex-col items-center gap-1 text-center ${
                    displayMode === 'coadd'
                      ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">Detector Stacks</span>
                </button>

                <button
                  onClick={() => setDisplayMode('rgb')}
                  className={`p-2.5 rounded-xl transition flex flex-col items-center gap-1 text-center ${
                    displayMode === 'rgb'
                      ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-xs">Color Mixer</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Single Channel Wavelength Scrubber */}
            {displayMode === 'single' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
                {/* Mode description banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-slate-100">102-Wavelength Scrubber</h3>
                  </div>
                  <span className="text-xs bg-cyan-950 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-lg border border-cyan-800">
                    {activeChanObj.wavelength} µm
                  </span>
                </div>

                {/* Autoplay / Video Controls */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isPlaying
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Autoplay'}</span>
                    </button>

                    <button
                      onClick={handlePrevChannel}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Previous channel"
                    >
                      ◀
                    </button>
                    <button
                      onClick={handleNextChannel}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Next channel"
                    >
                      ▶
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400 mr-1">Speed:</span>
                    {[1, 2, 4].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaySpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          playSpeed === spd
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentChannel(1);
                      }}
                      title="Reset to Channel 1"
                      className="ml-1 p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual Rainbow Spectrum Bar & Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Current Light Filter:</span>
                    <span className="font-semibold text-cyan-300">{activeChanObj.friendlyRegion}</span>
                  </div>

                  {/* Gradient Spectrum Preview */}
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 via-emerald-500 via-cyan-500 to-indigo-600 border border-slate-700 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white]"
                      style={{ left: `${((currentChannel - 1) / 101) * 100}%` }}
                    />
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="1"
                    max="102"
                    value={currentChannel}
                    onChange={(e) => setCurrentChannel(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-950 h-2.5 rounded-lg cursor-pointer mt-1"
                  />

                  {/* Range Milestones */}
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>0.75 µm (Near-IR)</span>
                    <span>2.88 µm (Water Ice)</span>
                    <span>5.01 µm (Thermal Heat)</span>
                  </div>
                </div>

                {/* Quick Discovery Presets */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Quick Discovery Jumps:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setCurrentChannel(10)}
                      className={`p-2 rounded-xl text-left border text-xs transition flex flex-col gap-0.5 ${
                        currentChannel === 10
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold">☀️ Hot Star</span>
                      <span className="text-[10px] text-slate-400">Chan 10 (0.95 µm)</span>
                    </button>

                    <button
                      onClick={() => setCurrentChannel(55)}
                      className={`p-2 rounded-xl text-left border text-xs transition flex flex-col gap-0.5 ${
                        currentChannel === 55
                          ? 'bg-pink-950/60 border-pink-500 text-pink-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold">🧊 Water Ice</span>
                      <span className="text-[10px] text-slate-400">Chan 55 (3.05 µm)</span>
                    </button>

                    <button
                      onClick={() => setCurrentChannel(96)}
                      className={`p-2 rounded-xl text-left border text-xs transition flex flex-col gap-0.5 ${
                        currentChannel === 96
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold">🪐 Brown Dwarf</span>
                      <span className="text-[10px] text-slate-400">Chan 96 (4.78 µm)</span>
                    </button>
                  </div>
                </div>

                {/* Educational Insight Card */}
                <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-300 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Why does the view change?</span>
                    Different cosmic objects radiate at different infrared temperatures. Hot stars glow in
                    near-infrared (left of slider), while cold brown dwarfs and methane clouds only emerge at
                    deep heat wavelengths (right of slider)!
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Detector Coadds (Stacked Images) */}
            {displayMode === 'coadd' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-slate-100">
                      Detector Stacks (Coadds)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {isSimpleMode
                      ? 'Combining 17 camera frames together removes background noise, like taking a crystal-clear long exposure photo.'
                      : 'Averages ~17 channels per focal plane array to increase Signal-to-Noise Ratio (SNR).'}
                  </p>
                </div>

                {/* Detector Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DETECTORS.map((det) => {
                    const isSelected = selectedDetectorCoadd === det.id;
                    return (
                      <button
                        key={det.id}
                        onClick={() => setSelectedDetectorCoadd(det.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-white">{det.name}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold"
                            style={{
                              backgroundColor: `${det.color}20`,
                              color: det.color,
                              border: `1px solid ${det.color}40`,
                            }}
                          >
                            {det.range}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-300">
                          {det.friendlyName}
                        </span>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {isSimpleMode ? det.simpleSummary : det.scienceSummary}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Active Detector Detail Box */}
                {(() => {
                  const det = DETECTORS.find((d) => d.id === selectedDetectorCoadd) || DETECTORS[0];
                  return (
                    <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-cyan-400">{det.friendlyName} Stack</span>
                        <span className="text-slate-400">{det.sideName} ({det.side})</span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        Stacking Channels {det.startIdx + 1} to {det.endIdx} ({det.range})
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: NASA False-Color RGB Mixer */}
            {displayMode === 'rgb' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-slate-100">NASA False-Color Mixer</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Infrared light is invisible to human eyes. NASA maps 3 different infrared channels to
                    Red, Green, and Blue to create vivid space pictures like the James Webb Space Telescope.
                  </p>
                </div>

                {/* 1-Click NASA Palette Presets */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-medium">1-Click Presets:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {RGB_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setRgbChannels(p.channels)}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 hover:bg-slate-900 transition text-left flex flex-col gap-0.5"
                      >
                        <span className="text-xs font-bold text-slate-200">{p.name}</span>
                        <span className="text-[10px] text-slate-400 leading-tight">{p.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Channel Color Sliders */}
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Red Channel */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-red-900/40 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-red-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                        Red (Longest Heat Waves)
                      </label>
                      <span className="font-mono text-slate-300 font-semibold">
                        Chan {rgbChannels.red} ({CHANNELS[rgbChannels.red - 1]?.wavelength} µm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="102"
                      value={rgbChannels.red}
                      onChange={(e) =>
                        setRgbChannels({ ...rgbChannels, red: Number(e.target.value) })
                      }
                      className="w-full accent-red-500 bg-slate-900 h-2 rounded cursor-pointer"
                    />
                  </div>

                  {/* Green Channel */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-900/40 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        Green (Mid-Infrared)
                      </label>
                      <span className="font-mono text-slate-300 font-semibold">
                        Chan {rgbChannels.green} ({CHANNELS[rgbChannels.green - 1]?.wavelength} µm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="102"
                      value={rgbChannels.green}
                      onChange={(e) =>
                        setRgbChannels({ ...rgbChannels, green: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-500 bg-slate-900 h-2 rounded cursor-pointer"
                    />
                  </div>

                  {/* Blue Channel */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-900/40 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-blue-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                        Blue (Near-Infrared / Starlight)
                      </label>
                      <span className="font-mono text-slate-300 font-semibold">
                        Chan {rgbChannels.blue} ({CHANNELS[rgbChannels.blue - 1]?.wavelength} µm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="102"
                      value={rgbChannels.blue}
                      onChange={(e) =>
                        setRgbChannels({ ...rgbChannels, blue: Number(e.target.value) })
                      }
                      className="w-full accent-blue-500 bg-slate-900 h-2 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Educational Cards: Making Space Simple for Everyone */}
        <section className="mt-4 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔭</span>
              <h4 className="font-bold text-sm text-cyan-300">Why 102 Colors Instead of 1?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard consumer cameras take 1 single photo using 3 broad colors (Red, Green, Blue).
              SPHEREx measures <strong>102 narrow slices of infrared light</strong>. This acts like a chemical
              barcode scanner across space, identifying water ice, methane, and carbon dioxide in distant planetary nurseries!
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪐</span>
              <h4 className="font-bold text-sm text-amber-300">What is a Brown Dwarf?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Brown dwarfs are "failed stars" that never grew massive enough to ignite nuclear fusion.
              They are freezing cold (-50°C to 400°C) and completely invisible to human eyes, but shine bright
              in mid-infrared heat where methane gas absorbs shorter wavelengths!
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌌</span>
              <h4 className="font-bold text-sm text-purple-300">NASA Space Apps Mission</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              SPHEREx surveys the entire sky every 6 months from low-Earth orbit. This interactive navigator
              demonstrates how astronomers scrub through spectral cubes to isolate cosmic objects that would
              otherwise stay forever hidden in the darkness.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}


