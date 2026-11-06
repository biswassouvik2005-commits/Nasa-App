// NASA SPHEREx Mission Data & Educational Definitions

export const DETECTORS = [
  {
    id: 1,
    name: 'Detector 1',
    friendlyName: 'Visible Edge & Hot Stars',
    range: '0.75 - 1.11 µm',
    side: 'SWIR',
    sideName: 'Near-Infrared',
    r: 41,
    startIdx: 0,
    endIdx: 17,
    simpleSummary: 'Captures normal starlight just past human red vision.',
    scienceSummary: 'Short-wave IR band (R~41). Senses hot stellar photospheres and optical transition.',
    color: '#38bdf8' // light sky blue
  },
  {
    id: 2,
    name: 'Detector 2',
    friendlyName: 'Galaxy Starlight',
    range: '1.11 - 1.64 µm',
    side: 'SWIR',
    sideName: 'Near-Infrared',
    r: 41,
    startIdx: 17,
    endIdx: 34,
    simpleSummary: 'Pierces through interstellar dust to reveal galaxy cores.',
    scienceSummary: 'SWIR continuum band (R~41). Maps large-scale galaxy clustering across cosmic time.',
    color: '#818cf8' // indigo
  },
  {
    id: 3,
    name: 'Detector 3',
    friendlyName: 'Cosmic Dawn & Dust',
    range: '1.64 - 2.42 µm',
    side: 'SWIR',
    sideName: 'Near-Infrared',
    r: 41,
    startIdx: 34,
    endIdx: 51,
    simpleSummary: 'Traces the light of the earliest stars born in the young universe.',
    scienceSummary: 'Deep SWIR band (R~41). Probes Epoch of Reionization (EoR) extragalactic background.',
    color: '#a855f7' // purple
  },
  {
    id: 4,
    name: 'Detector 4',
    friendlyName: 'Water & Ice Hunter',
    range: '2.40 - 3.82 µm',
    side: 'MWIR',
    sideName: 'Mid-Infrared',
    r: 135,
    startIdx: 51,
    endIdx: 68,
    simpleSummary: 'Detects water ice (H₂O) and organic molecules around young solar systems.',
    scienceSummary: 'High-res MWIR band (R~135). Sensitive to 3.05 µm H₂O ice and CO₂ ice absorption lines.',
    color: '#ec4899' // pink
  },
  {
    id: 5,
    name: 'Detector 5',
    friendlyName: 'Deep Thermal Warmth',
    range: '3.82 - 4.42 µm',
    side: 'MWIR',
    sideName: 'Mid-Infrared',
    r: 128,
    startIdx: 68,
    endIdx: 85,
    simpleSummary: 'Senses gentle heat radiation from cool cosmic dust clouds.',
    scienceSummary: 'Mid-wavelength IR band (R~128). Resolves circumstellar disks and cool stellar envelopes.',
    color: '#f97316' // orange
  },
  {
    id: 6,
    name: 'Detector 6',
    friendlyName: 'Cold Worlds & Methane',
    range: '4.42 - 5.01 µm',
    side: 'MWIR',
    sideName: 'Mid-Infrared',
    r: 130,
    startIdx: 85,
    endIdx: 102,
    simpleSummary: 'Reveals freezing "failed stars" (Brown Dwarfs) glowing through methane gas.',
    scienceSummary: 'Longest SPHEREx MWIR band (R~130). Penetrates 4.6-5.0 µm methane (CH₄) absorption windows.',
    color: '#eab308' // yellow
  },
];

export const CHANNELS = Array.from({ length: 102 }, (_, i) => {
  const wl = 0.75 + (i / 101) * (5.01 - 0.75);
  const detector = DETECTORS.find(d => i >= d.startIdx && i < d.endIdx) || DETECTORS[5];
  
  // Everyday analogy for this wavelength range
  let friendlyRegion = 'Near-Infrared (Near Visible Light)';
  if (wl >= 1.2 && wl < 2.4) friendlyRegion = 'Near-Infrared (Dust Piercing)';
  else if (wl >= 2.4 && wl < 3.8) friendlyRegion = 'Mid-Infrared (Water & Ice Realm)';
  else if (wl >= 3.8) friendlyRegion = 'Mid-Infrared (Thermal Heat & Methane)';

  return {
    number: i + 1,
    index: i,
    wavelength: wl.toFixed(2),
    detectorId: detector.id,
    detectorName: detector.name,
    detectorFriendly: detector.friendlyName,
    side: detector.side,
    sideName: detector.sideName,
    resolvingPower: detector.r,
    friendlyRegion,
  };
});

export const CELESTIAL_OBJECTS = [
  {
    id: 'star-alpha',
    name: 'Star Alpha (Hot Star)',
    simpleTitle: 'Sun-Like Hot Star',
    type: 'Main Sequence Star (G-Type)',
    x: 20,
    y: 20,
    pctX: 31.25,
    pctY: 31.25,
    temperature: '~5,600 K (Hot)',
    badgeColor: 'amber',
    simpleDescription: 'A blazing warm star like our Sun. It glows intensely in near-infrared light and naturally fades as we look at deeper heat wavelengths.',
    scienceDescription: 'Normal stellar blackbody radiator peaking near optical/SWIR wavelengths. Thermal emission tails off toward MWIR (5 µm).',
    getExpectedFlux: (chanIdx) => {
      const thermalFactor = Math.max(0.1, 1 - (chanIdx / 102) * 0.8);
      return 8.0 * thermalFactor;
    },
    getVisibilityExplanation: (chanIdx) => {
      if (chanIdx < 35) return 'Very Bright! Star Alpha is radiating peak starlight in near-infrared.';
      if (chanIdx < 70) return 'Moderately Bright. Blackbody emission begins to cool down.';
      return 'Faint. Only residual thermal radiation reaches deep mid-infrared detectors.';
    }
  },
  {
    id: 'brown-dwarf',
    name: 'WISE 0855 (Brown Dwarf)',
    simpleTitle: 'Cold "Failed Star" (Brown Dwarf)',
    type: 'Sub-stellar Brown Dwarf (Y-Dwarf)',
    x: 45,
    y: 42,
    pctX: 70.3,
    pctY: 65.6,
    temperature: '~250 K (-23 °C / Freezing!)',
    badgeColor: 'cyan',
    simpleDescription: 'An ultra-cold failed star floating in deep space. Invisible in normal light, it suddenly flashes brightly in deep infrared heat due to methane gas in its atmosphere!',
    scienceDescription: 'Ultra-cool atmospheric methane (CH₄) absorption bands. Near 4.6–5.0 µm, an atmospheric window allows deep internal heat flux to shine through.',
    getExpectedFlux: (chanIdx) => {
      return chanIdx > 75 ? Math.pow((chanIdx - 75) / 27, 1.5) * 12.0 : 0.02;
    },
    getVisibilityExplanation: (chanIdx) => {
      if (chanIdx <= 75) return 'Completely Invisible! The dwarf is too cold to emit near-infrared light. It blends into empty space.';
      if (chanIdx <= 88) return 'Emerging! Its atmosphere\'s methane window begins opening, letting thermal warmth escape.';
      return 'Blazing Bright! Thermal emission pours through the methane window at 4.6–5.0 µm.';
    }
  }
];

export const STORIES = [
  {
    id: 'intro',
    title: '☀️ Hot Star Dominance',
    subtitle: 'See the universe in near-infrared',
    channel: 10,
    displayMode: 'single',
    focusObjectId: 'star-alpha',
    badge: 'Step 1 of 4',
    narration: 'Look at Star Alpha (top-left). Hot stars burn bright in near-infrared (0.9 µm), while cold space around it appears empty and quiet.',
    tip: 'Click Next to see what happens when we look into deep thermal heat!'
  },
  {
    id: 'water-ice',
    title: '🧊 The Cosmic Ice Zone',
    subtitle: 'Hunting the building blocks of planets',
    channel: 55,
    displayMode: 'single',
    focusObjectId: null,
    badge: 'Step 2 of 4',
    narration: 'We have shifted to 3.05 µm. This is the exact wavelength where SPHEREx scans for water ice (H₂O) and carbon dioxide frozen onto interstellar dust grains.',
    tip: 'Planetary systems form from these icy grains!'
  },
  {
    id: 'brown-dwarf-discovery',
    title: '🪐 Secret Failed Star Appears!',
    subtitle: 'Methane window detection',
    channel: 96,
    displayMode: 'single',
    focusObjectId: 'brown-dwarf',
    badge: 'Step 3 of 4',
    narration: 'Look at the bottom-right! A cold Brown Dwarf (WISE 0855) suddenly flares into view! It was invisible before, but now shines brightly at 4.7 µm.',
    tip: 'This is the magic of infrared astronomy: discovering hidden cold worlds.'
  },
  {
    id: 'false-color-magic',
    title: '🎨 NASA False-Color View',
    subtitle: 'Combining 3 infrared colors into 1 image',
    channel: 96,
    displayMode: 'rgb',
    focusObjectId: null,
    badge: 'Step 4 of 4',
    narration: 'Since human eyes cannot see infrared, NASA assigns Red (deep heat), Green (mid-IR), and Blue (near-IR). Both the hot star and cold dwarf are now visible together!',
    tip: 'You can customize the colors in the Color Mixer tab.'
  }
];

export const RGB_PRESETS = [
  {
    id: 'jwst',
    name: '🔭 Webb Deep Field',
    description: 'NASA standard infrared false-color composite.',
    channels: { red: 95, green: 52, blue: 14 }
  },
  {
    id: 'thermal',
    name: '🔥 Temperature Heatmap',
    description: 'Maximizes contrast between hot stars and cold methane worlds.',
    channels: { red: 100, green: 70, blue: 10 }
  },
  {
    id: 'ice',
    name: '🧊 Cosmic Ice & Dust',
    description: 'Tuned to highlight water ice absorption at ~3 µm.',
    channels: { red: 80, green: 56, blue: 24 }
  }
];

export const GLOSSARY = [
  {
    term: 'SPHEREx',
    simple: 'A NASA space telescope mapping the entire sky in 102 infrared colors.',
    detail: 'Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer.'
  },
  {
    term: 'Infrared Light',
    simple: 'Light with longer wavelengths than red light. Human eyes cannot see it, but we feel it as heat.',
    detail: 'SPHEREx observes between 0.75 µm and 5.01 µm, piercing through interstellar dust.'
  },
  {
    term: 'Brown Dwarf',
    simple: 'A "failed star" too lightweight to ignite nuclear fusion. Too cold for visible light, but glows in infrared heat.',
    detail: 'Substellar objects with masses between heavy gas giant planets and the lowest-mass stars.'
  },
  {
    term: 'Detector Coadd',
    simple: 'Like taking a long-exposure photograph! Stacking multiple channel pictures together to make faint objects clearer.',
    detail: 'Averaging the 17 spectral frames in a single detector array to boost the Signal-to-Noise Ratio (SNR).'
  },
  {
    term: 'False-Color Image',
    simple: 'Mapping invisible light colors to Red, Green, and Blue so human eyes can see cosmic details.',
    detail: 'Chromatic representation where 3 distinct non-optical wavelengths are assigned to RGB display channels.'
  },
  {
    term: 'Resolving Power (R)',
    simple: 'How finely the telescope can divide rainbow colors of light. Higher R means sharper spectral details.',
    detail: 'R = λ / Δλ. SPHEREx provides R~41 in SWIR (Detectors 1-3) and R~130 in MWIR (Detectors 4-6).'
  },
  {
    term: 'PSF (Point Spread Function)',
    simple: 'The size of a single telescope pixel on the sky (6.15 arcseconds per pixel).',
    detail: '6.15″/px undersampled PSF designed to cover the entire celestial sphere efficiently.'
  }
];
