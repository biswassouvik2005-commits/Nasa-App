import { STORIES } from '../data/spherexData';
import { Sparkles, ChevronRight, ChevronLeft, Compass } from 'lucide-react';

export default function StoryGuide({
  onSelectStory,
  activeStoryId,
}) {
  const activeIndex = STORIES.findIndex((s) => s.id === activeStoryId);
  const currentStory = activeIndex >= 0 ? STORIES[activeIndex] : STORIES[0];

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % STORIES.length;
    onSelectStory(STORIES[nextIdx]);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + STORIES.length) % STORIES.length;
    onSelectStory(STORIES[prevIdx]);
  };

  return (
    <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/20 p-1.5 rounded-lg text-cyan-300 border border-cyan-500/40">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Guided Cosmic Tour <span className="text-[11px] font-normal text-cyan-300">({currentStory.badge})</span>
            </h3>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STORIES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => onSelectStory(s)}
              title={s.title}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeStoryId === s.id
                  ? 'bg-cyan-400 scale-125 ring-2 ring-cyan-400/50'
                  : idx < activeIndex
                  ? 'bg-cyan-700 hover:bg-cyan-500'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Story Content Card */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-cyan-300">{currentStory.title}</span>
            <span className="text-xs text-slate-400">• {currentStory.subtitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed font-normal">
            {currentStory.narration}
          </p>
          <p className="text-[11px] text-amber-300/90 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            {currentStory.tip}
          </p>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1"
            title="Previous story step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition text-xs flex items-center gap-1 shadow-md shadow-cyan-900/30"
          >
            <span>Next Discovery</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
