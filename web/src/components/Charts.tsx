// src/components/Charts.tsx
// Recharts-based chart components for the FlockSense workspace.
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  Cell, Pie, PieChart, BarChart, Bar,
} from 'recharts';
import type { EmissionBreakdown } from '../lib/engine';
type TrendPoint = { month: string; farm: number; cooperative?: number };

/* ── Footprint Trend Line ── */
export function FootprintTrend({ data }: { data?: TrendPoint[] }) {
  const points = data ?? [];
  if (points.length < 2) {
    return <p style={{ padding: '44px 0', textAlign: 'center', fontSize: 13, color: '#6B5B5B' }}>Log at least two periods to see your trend.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={points} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B5B5B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B5B5B' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #EDE0E0', borderRadius: 12, fontSize: 12 }}
          formatter={(v) => [`${Number(v ?? 0).toFixed(2)} tCO₂e`]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#6B5B5B', paddingTop: 8 }}
        />
        <Line
          dataKey="farm"
          name="Your farm"
          stroke="#800020"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#800020' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Emissions Donut ── */
export function EmissionsDonut({
  data,
  selected,
  onSelect,
}: {
  data: EmissionBreakdown[];
  selected?: string;
  onSelect?: (name: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            onClick={(entry) => onSelect?.(entry.name as string)}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={d.color}
                opacity={selected && selected !== d.name ? 0.4 : 1}
                stroke={selected === d.name ? '#fff' : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #EDE0E0', borderRadius: 12, fontSize: 12 }}
            formatter={(v) => [`${Math.round(Number(v ?? 0)).toLocaleString()} kg CO₂e`]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', justifyContent: 'center' }}>
        {data.map((d) => (
          <button
            key={d.name}
            onClick={() => onSelect?.(d.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              color: selected === d.name ? '#2D1B1B' : '#6B5B5B',
              opacity: selected && selected !== d.name ? 0.5 : 1,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'block' }} />
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Benchmark Bars ── */
export type BenchmarkBar = { name: string; value: number; fill: string };

export function BenchmarkBars({ data }: { data: BenchmarkBar[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#6B5B5B' }}
          axisLine={false}
          tickLine={false}
          unit=" kg"
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6B5B5B' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #EDE0E0', borderRadius: 12, fontSize: 12 }}
          formatter={(v) => [`${Number(v ?? 0).toFixed(1)} kg CO₂e / animal`]}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
          {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
