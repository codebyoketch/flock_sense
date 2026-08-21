// src/lib/engine.ts
// CO₂e calculation engine — adapted from flocksense-mvp for Go backend types.
import type { Entry, EnergySource, WasteHandling } from '../types';

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

const energyFactor: Record<EnergySource, number> = {
  grid: 0.45, solar: 0.07, diesel: 0.72, other: 0.55,
};
const wasteFactor: Record<WasteHandling, number> = {
  open_pile: 5.1, composted: 3.8, biogas: 2.5, other: 4.3,
};
const energyEfficiency: Record<EnergySource, number> = {
  grid: 76, solar: 94, diesel: 48, other: 64,
};
const wasteScore: Record<WasteHandling, number> = {
  composted: 90, biogas: 88, other: 80, open_pile: 70,
};

export function calculateFromEntry(entry: Entry, animalCount: number): Calculation {
  const feedKg     = entry.feed.quantity_kg;
  const energyKwh  = entry.energy.quantity_kwh;
  const waterL     = entry.water.quantity_liters;
  const esrc       = entry.energy.source;
  const wmethod    = entry.waste_handling;

  const feed  = feedKg * 1.2;
  const energy = energyKwh * energyFactor[esrc];
  const water  = waterL * 0.0003;
  const waste  = animalCount * wasteFactor[wmethod];
  const totalKg = feed + energy + water + waste;
  const perAnimal = totalKg / Math.max(1, animalCount);

  const breakdown: EmissionBreakdown[] = [
    { name: 'Feed',   value: feed,   color: '#800020', detail: `${feedKg} kg — ${entry.feed.type}` },
    { name: 'Energy', value: energy, color: '#FF8C42', detail: `${energyKwh} kWh — ${esrc}` },
    { name: 'Water',  value: water,  color: '#9CAF88', detail: `${waterL.toLocaleString()} L` },
    { name: 'Waste',  value: waste,  color: '#C47A50', detail: `${wmethod.replace('_', ' ')} handling` },
  ];

  const carbonEff  = clamp(Math.round(100 - perAnimal * 3), 30, 95);
  const resourceEff = clamp(Math.round(90 - (waterL / Math.max(1, animalCount)) * 0.5), 42, 93);
  const verifConf  = entry.status === 'verified' ? 86 : 60;

  const dimensions = [
    { label: 'Carbon efficiency',      value: carbonEff },
    { label: 'Energy efficiency',      value: energyEfficiency[esrc] },
    { label: 'Waste management',       value: wasteScore[wmethod] },
    { label: 'Resource efficiency',    value: resourceEff },
    { label: 'Verification confidence', value: verifConf },
  ];

  const score = Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length);
  const highestCategory = [...breakdown].sort((a, b) => b.value - a.value)[0];
  const anomaly = energyKwh < Math.max(15, animalCount * 0.15)
    ? `Reported energy use is unusually low for ${animalCount} animals — ask a peer to confirm.`
    : null;

  return { totalKg, totalTons: totalKg / 1000, perAnimal, breakdown, score, grade: scoreGrade(score), dimensions, highestCategory, anomaly };
}

export function getRecommendation(calc: Calculation, wmethod: WasteHandling, esrc: EnergySource) {
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
