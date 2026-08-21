// src/lib/engine.ts
// CO₂e calculation engine — works with the Go backend's flat Entry model.
import type { Entry, EnergySource, LivestockType, WasteHandling } from '../types';

export type EmissionBreakdown = {
  name: 'Feed' | 'Energy' | 'Water' | 'Waste';
  value: number;
  color: string;
  detail: string;
};

export type Calculation = {
  totalKg: number;
  totalTons: number;
  perAnimal: number;
  breakdown: EmissionBreakdown[];
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  dimensions: { label: string; value: number }[];
  highestCategory: EmissionBreakdown;
  anomaly: string | null;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function scoreGrade(s: number): Calculation['grade'] {
  if (s >= 88) return 'A';
  if (s >= 75) return 'B';
  if (s >= 63) return 'C';
  if (s >= 50) return 'D';
  return 'E';
}

// These values mirror backend/internal/emissions/calculator.go. The frontend
// only uses them to render an explainable category breakdown; the API remains
// the source of truth for the stored entry total.
const feedFactor: Record<LivestockType, number> = {
  poultry: 0.9, dairy: 0.7, goats: 0.6, other: 0.75,
};
const energyFactor: Record<EnergySource, number> = {
  grid: 0.42, solar: 0.05, diesel: 0.75, other: 0.5,
};
const wasteFactor: Record<WasteHandling, number> = {
  open_pile: 0.35, composted: 0.12, biogas: 0.05, other: 0.25,
};
const energyEfficiency: Record<EnergySource, number> = {
  grid: 76, solar: 94, diesel: 48, other: 64,
};
const wasteScore: Record<WasteHandling, number> = {
  composted: 90, biogas: 88, other: 80, open_pile: 70,
};

/**
 * Calculate CO₂e from a Go backend Entry (flat fields).
 * The Go model uses: feed_kg, energy_kwh, water_liters, energy_source, waste_handling.
 */
export function calculateFromEntry(entry: Entry, animalCount: number, holdingType: LivestockType = 'other'): Calculation {
  // Go Entry uses flat fields — NOT nested objects
  const feedKg    = entry.feed_kg;
  const energyKwh = entry.energy_kwh;
  const waterL    = entry.water_liters;
  const esrc      = entry.energy_source as EnergySource;
  const wmethod   = entry.waste_handling as WasteHandling;

  const feed   = feedKg * feedFactor[holdingType];
  const energy = energyKwh * (energyFactor[esrc] ?? 0.45);
  const water  = waterL * 0.0003;
  const waste  = wasteFactor[wmethod] ?? 0.25;
  const totalKg   = feed + energy + water + waste;
  const perAnimal = totalKg / Math.max(1, animalCount);

  const feedDetail   = `${feedKg} kg — ${entry.feed_type}`;
  const energyDetail = `${energyKwh} kWh — ${esrc}`;
  const waterDetail  = `${waterL.toLocaleString()} L`;
  const wasteDetail  = `${(wmethod ?? '').replace('_', ' ')} handling`;

  const breakdown: EmissionBreakdown[] = [
    { name: 'Feed',   value: feed,   color: '#800020', detail: feedDetail },
    { name: 'Energy', value: energy, color: '#FF8C42', detail: energyDetail },
    { name: 'Water',  value: water,  color: '#9CAF88', detail: waterDetail },
    { name: 'Waste',  value: waste,  color: '#C47A50', detail: wasteDetail },
  ];

  const carbonEff   = clamp(Math.round(100 - perAnimal * 3), 30, 95);
  const resourceEff = clamp(Math.round(90 - (waterL / Math.max(1, animalCount)) * 0.5), 42, 93);
  const verifConf   = entry.status === 'verified' ? 86 : 60;

  const dimensions = [
    { label: 'Carbon efficiency',       value: carbonEff },
    { label: 'Energy efficiency',       value: energyEfficiency[esrc] ?? 64 },
    { label: 'Waste management',        value: wasteScore[wmethod] ?? 70 },
    { label: 'Resource efficiency',     value: resourceEff },
    { label: 'Verification confidence', value: verifConf },
  ];

  const score = Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length);
  const highestCategory = [...breakdown].sort((a, b) => b.value - a.value)[0];

  const anomaly = energyKwh < Math.max(15, animalCount * 0.15)
    ? `Reported energy use is unusually low for ${animalCount} animals — ask a peer to confirm.`
    : null;

  return {
    totalKg, totalTons: totalKg / 1000, perAnimal,
    breakdown, score, grade: scoreGrade(score),
    dimensions, highestCategory, anomaly,
  };
}

export function getRecommendation(
  calc: Calculation,
  wmethod: WasteHandling,
  esrc: EnergySource,
) {
  if (calc.highestCategory.name === 'Waste' && wmethod !== 'composted') {
    return {
      title: 'Waste is your clearest improvement opportunity.',
      body: 'Composting manure instead of open disposal could reduce waste-related emissions by an estimated 18%.',
      impact: 'Est. 0.23 tCO₂e less per reporting period',
      action: 'Explore composting',
    };
  }
  if (calc.highestCategory.name === 'Energy' && esrc !== 'solar') {
    return {
      title: 'Energy is carrying more of your footprint than it needs to.',
      body: 'Solar water heating could reduce energy-related emissions by an estimated 24%.',
      impact: 'Lower monthly grid dependence',
      action: 'Review solar options',
    };
  }
  return {
    title: 'You are maintaining a strong sustainability baseline.',
    body: 'Keep your current practices and continue monitoring monthly so the record stays useful to your cooperative.',
    impact: 'Protect your verified trend',
    action: 'Keep monitoring',
  };
}

// Fallback trend data shown when no entries exist yet
export const placeholderTrend = [
  { month: 'Mar', farm: 2.22, cooperative: 2.44 },
  { month: 'Apr', farm: 2.15, cooperative: 2.38 },
  { month: 'May', farm: 2.08, cooperative: 2.33 },
  { month: 'Jun', farm: 2.01, cooperative: 2.27 },
  { month: 'Jul', farm: 1.93, cooperative: 2.23 },
  { month: 'Aug', farm: 1.82, cooperative: 2.18 },
];
