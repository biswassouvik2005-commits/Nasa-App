import { CELESTIAL_OBJECTS } from '../data/spherexData';
import { Zap } from 'lucide-react';

export default function ObjectInspector({
  selectedObject,
  onSelectObject,
  currentChannel,
  isSimpleMode,
}) {
  const activeObj = selectedObject || CELESTIAL_OBJECTS[0];
  const currentFlux = activeObj.getExpectedFlux(currentChannel - 1);
  const maxPossibleFlux = 12.0;
  const brightnessPercent = Math.min(100, Math.round((currentFlux / maxPossibleFlux) * 100));

  return (
    <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Object Switcher Pills */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Target Inspector
        </span>
        <div className="flex gap-1.5">
          {CELESTIAL_OBJECTS.map((obj) => (
            <button
              key={obj.id}
              onClick={() => onSelectObject(obj)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeObj.id === obj.id
                  ? obj.id === 'star-alpha'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{obj.id === 'star-alpha' ? '☀️' : '🪐'}</span>
              <span>{obj.id === 'star-alpha' ? 'Star Alpha' : 'WISE 0855'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Object Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              {activeObj.simpleTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isSimpleMode ? activeObj.type : `${activeObj.type} • Coords: (${activeObj.x}, ${activeObj.y})`}
          </p>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
            activeObj.id === 'star-alpha'
              ? 'bg-amber-950/60 text-amber-300 border-amber-600/40'
              : 'bg-cyan-950/60 text-cyan-300 border-cyan-600/40'
          }`}
        >
          {activeObj.temperature}
        </span>
      </div>

      {/* Real-time Brightness Meter */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Current Brightness (Flux):
          </span>
          <span className="font-mono font-bold text-cyan-400">
            {currentFlux.toFixed(2)} {isSimpleMode ? `(${brightnessPercent}%)` : 'counts/pixel'}
          </span>
        </div>

        {/* Meter progress bar */}
        <div className="w-full bg-slate-800/70 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              activeObj.id === 'star-alpha'
                ? 'bg-gradient-to-r from-amber-600 to-amber-300'
                : 'bg-gradient-to-r from-teal-500 to-cyan-300'
            }`}
            style={{ width: `${Math.max(4, brightnessPercent)}%` }}
          />
        </div>

        {/* Intuitive status explanation */}
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {activeObj.getVisibilityExplanation(currentChannel - 1)}
        </p>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {isSimpleMode ? activeObj.simpleDescription : activeObj.scienceDescription}
      </p>
    </div>
  );
}
