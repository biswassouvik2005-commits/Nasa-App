import { CHANNELS, CELESTIAL_OBJECTS } from '../data/spherexData';
import { Activity } from 'lucide-react';

export default function SpectrumChart({
  currentChannel,
  onSelectChannel,
  selectedObject,
  isSimpleMode,
}) {
  const width = 500;
  const height = 140;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Max flux in simulation is ~13.0
  const maxFlux = 13.0;

  // Generate SVG path for Star Alpha
  const starAlphaPoints = CHANNELS.map((ch, idx) => {
    const x = padding.left + (idx / 101) * graphWidth;
    const flux = CELESTIAL_OBJECTS[0].getExpectedFlux(idx);
    const y = padding.top + graphHeight - (flux / maxFlux) * graphHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const starAlphaPath = `M ${starAlphaPoints.join(' L ')}`;

  // Generate SVG path for Brown Dwarf
  const brownDwarfPoints = CHANNELS.map((ch, idx) => {
    const x = padding.left + (idx / 101) * graphWidth;
    const flux = CELESTIAL_OBJECTS[1].getExpectedFlux(idx);
    const y = padding.top + graphHeight - (flux / maxFlux) * graphHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const brownDwarfPath = `M ${brownDwarfPoints.join(' L ')}`;

  // Current channel marker X coordinate
  const currentX = padding.left + ((currentChannel - 1) / 101) * graphWidth;

  const handleGraphClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const relativeX = (clickX / rect.width) * width;
    const clampedX = Math.max(padding.left, Math.min(width - padding.right, relativeX));
    const channelIdx = Math.round(((clampedX - padding.left) / graphWidth) * 101);
    onSelectChannel(channelIdx + 1);
  };

  const starFluxNow = CELESTIAL_OBJECTS[0].getExpectedFlux(currentChannel - 1);
  const dwarfFluxNow = CELESTIAL_OBJECTS[1].getExpectedFlux(currentChannel - 1);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            {isSimpleMode ? 'Cosmic Brightness Chart' : 'Spectral Energy Distribution (SED)'}
          </h4>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-slate-300">Hot Star</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span className="text-slate-300">Cold Brown Dwarf</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        {isSimpleMode
          ? 'Notice how the Cold Dwarf stays flat at zero, then skyrockets at longer infrared heat waves!'
          : 'Shows flux density vs wavelength (0.75 - 5.01 µm). Click anywhere on the curve to jump to that channel.'}
      </p>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden select-none cursor-pointer" onClick={handleGraphClick}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible rounded-xl bg-slate-950/70 p-1 border border-slate-800"
        >
          {/* Subtle grid lines */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight * 0.25}
            x2={width - padding.right}
            y2={padding.top + graphHeight * 0.25}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + graphHeight * 0.5}
            x2={width - padding.right}
            y2={padding.top + graphHeight * 0.5}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + graphHeight * 0.75}
            x2={width - padding.right}
            y2={padding.top + graphHeight * 0.75}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />

          {/* Methane window highlighted zone (Channels 75 to 102) */}
          <rect
            x={padding.left + (75 / 101) * graphWidth}
            y={padding.top}
            width={(26 / 101) * graphWidth}
            height={graphHeight}
            fill="#06b6d4"
            fillOpacity="0.08"
            rx="4"
          />
          <text
            x={padding.left + (88 / 101) * graphWidth}
            y={padding.top + 14}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="9"
            fontWeight="600"
          >
            Methane Window (CH₄)
          </text>

          {/* Star Alpha Curve */}
          <path
            d={starAlphaPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={selectedObject?.id === 'star-alpha' ? '3' : '2'}
            strokeLinecap="round"
            className="transition-all"
          />

          {/* Brown Dwarf Curve */}
          <path
            d={brownDwarfPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={selectedObject?.id === 'brown-dwarf' ? '3' : '2'}
            strokeLinecap="round"
            className="transition-all"
          />

          {/* Active Channel Indicator Line */}
          <line
            x1={currentX}
            y1={padding.top}
            x2={currentX}
            y2={padding.top + graphHeight}
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
          <circle cx={currentX} cy={padding.top + 4} r="3.5" fill="#ffffff" />

          {/* Star intersection dot */}
          <circle
            cx={currentX}
            cy={padding.top + graphHeight - (starFluxNow / maxFlux) * graphHeight}
            r="4.5"
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Dwarf intersection dot */}
          <circle
            cx={currentX}
            cy={padding.top + graphHeight - (dwarfFluxNow / maxFlux) * graphHeight}
            r="4.5"
            fill="#06b6d4"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* X Axis labels */}
          <text x={padding.left} y={height - 8} fill="#64748b" fontSize="10">
            0.75 µm
          </text>
          <text x={padding.left + graphWidth * 0.5} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="10">
            2.88 µm
          </text>
          <text x={width - padding.right} y={height - 8} textAnchor="end" fill="#64748b" fontSize="10">
            5.01 µm
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Current Wavelength: <strong className="text-white">{CHANNELS[currentChannel - 1]?.wavelength} µm</strong></span>
        <span className="text-[11px] text-cyan-400 font-medium">Click chart to jump</span>
      </div>
    </div>
  );
}
