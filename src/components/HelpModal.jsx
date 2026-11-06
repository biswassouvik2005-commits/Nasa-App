import { GLOSSARY } from '../data/spherexData';
import { Telescope, X, BookOpen, Sparkles } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Telescope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">How This App Works</h2>
              <p className="text-xs text-slate-400">NASA SPHEREx 102-Channel Space Mission Explorer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Simple Steps */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 3 Steps to Explore
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <span className="text-xs font-bold text-cyan-400">1. Drag or Play ▶️</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Move the wavelength scrubber or press Play to scan through 102 invisible infrared colors.
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <span className="text-xs font-bold text-amber-400">2. Spot Hidden Objects</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notice how the cold Brown Dwarf at the bottom-right flashes into view at 4.7 µm!
              </p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <span className="text-xs font-bold text-purple-400">3. Mix False Colors</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Switch to the Color Mixer tab to create James Webb-style false-color space images.
              </p>
            </div>
          </div>
        </div>

        {/* What is SPHEREx? */}
        <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-2">
          <h4 className="text-sm font-bold text-cyan-300">What is NASA SPHEREx?</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer)
            is a NASA astrophysics mission. While traditional space cameras take pictures in only 3 colors
            (Red, Green, Blue), SPHEREx takes pictures in <strong>102 distinct infrared colors</strong> for every single
            pixel on the entire sky. This acts like a chemical scanner, mapping water ice, methane, and the birth of stars!
          </p>
        </div>

        {/* Plain English Glossary */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Space Terms in Plain English
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GLOSSARY.map((item, idx) => (
              <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl flex flex-col gap-1">
                <span className="text-xs font-bold text-cyan-300">{item.term}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{item.simple}</p>
                <p className="text-[11px] text-slate-500 italic mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-lg shadow-cyan-900/30"
          >
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
}
