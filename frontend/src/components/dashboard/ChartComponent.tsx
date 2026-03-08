// components/dashboard/ChartComponent.tsx — EcoTrade Rwanda
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

// ── EcoTrade brand palette ──────────────────────────────────
const ECO_COLORS = [
  '#0891b2', // cyan-600
  '#10b981', // cyan-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#0f89ab', // dark-cyan
];

interface ChartDataSet {
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  label?: string;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataSet[];
}

interface ChartComponentProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'multiBar' | 'radar' | 'donut';
  data: ChartData;
  width?: string | number;
  height?: number;
  /** Show reference average line on bar/line/area charts */
  showAvgLine?: boolean;
  /** Y-axis label formatter (e.g. 'RWF' | 'kg' | '%') */
  yLabel?: string;
  /** Stack bar segments */
  stacked?: boolean;
}

// Custom tooltip with EcoTrade styling
const EcoTooltip = ({ active, payload, label, isDark, yLabel }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2.5 rounded-xl border shadow-lg text-xs min-w-[110px]
      ${isDark ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
      <p className="font-semibold mb-1.5 text-gray-500 dark:text-gray-400">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-500 dark:text-gray-400">{entry.name}</span>
          </div>
          <span className="font-bold" style={{ color: entry.color }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {yLabel ? ` ${yLabel}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

// Custom pie label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ChartComponent: React.FC<ChartComponentProps> = ({
  type, data, height = 300, showAvgLine, yLabel, stacked,
}) => {
  const { isDark } = useTheme();
  const grid   = isDark ? '#374151' : '#f3f4f6';
  const axis   = isDark ? '#6b7280' : '#9ca3af';

  if (!data.datasets?.length || !data.labels?.length) {
    return (
      <div className="flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  // Build flat chart-friendly data: [{ name: 'Mon', A: 120, B: 80 }, ...]
  const chartData = data.labels.map((label, i) => {
    const point: Record<string, string | number> = { name: label };
    data.datasets.forEach((ds, di) => {
      point[ds.label || `Series ${di + 1}`] = ds.data[i] ?? 0;
    });
    return point;
  });

  const avgVal = (() => {
    const all = data.datasets.flatMap(ds => ds.data);
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  })();

  const axisProps = {
    tick: { fill: axis, fontSize: 11 },
    axisLine: { stroke: grid },
    tickLine: false,
  };

  const tooltipContent = <EcoTooltip isDark={isDark} yLabel={yLabel} />;

  switch (type) {
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {data.datasets.map((ds, di) => (
                <linearGradient key={di} id={`areaGrad${di}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={ds.borderColor || ECO_COLORS[di]} stopOpacity={isDark ? 0.35 : 0.2} />
                  <stop offset="95%" stopColor={ds.borderColor || ECO_COLORS[di]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={tooltipContent} />
            <Legend wrapperStyle={{ fontSize: 12, color: axis }} />
            {showAvgLine && <ReferenceLine y={avgVal} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Avg', fill: '#f59e0b', fontSize: 10 }} />}
            {data.datasets.map((ds, di) => (
              <Area
                key={di}
                type="monotone"
                dataKey={ds.label || `Series ${di + 1}`}
                stroke={ds.borderColor || ECO_COLORS[di]}
                strokeWidth={2.5}
                fill={`url(#areaGrad${di})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={800}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={tooltipContent} />
            <Legend wrapperStyle={{ fontSize: 12, color: axis }} />
            {showAvgLine && <ReferenceLine y={avgVal} stroke="#f59e0b" strokeDasharray="4 4" />}
            {data.datasets.map((ds, di) => (
              <Line
                key={di}
                type="monotone"
                dataKey={ds.label || `Series ${di + 1}`}
                stroke={ds.borderColor || ECO_COLORS[di]}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: ds.borderColor || ECO_COLORS[di] }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={800}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
    case 'multiBar':
      return (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={tooltipContent} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', radius: 4 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: axis }} />
            {showAvgLine && <ReferenceLine y={avgVal} stroke="#f59e0b" strokeDasharray="4 4" />}
            {data.datasets.map((ds, di) => (
              <Bar
                key={di}
                dataKey={ds.label || `Series ${di + 1}`}
                fill={ds.backgroundColor || ECO_COLORS[di]}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
                isAnimationActive
                animationDuration={800}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
    case 'donut': {
      const firstDs = data.datasets[0];
      const pieData = data.labels.map((label, i) => ({
        name: label,
        value: firstDs.data[i] ?? 0,
      }));
      const innerRadius = type === 'donut' ? '55%' : 0;
      return (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius="75%"
              dataKey="value"
              labelLine={false}
              label={type === 'pie' ? renderPieLabel : undefined}
              isAnimationActive
              animationDuration={800}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={ECO_COLORS[i % ECO_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={tooltipContent} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: axis }}
              formatter={(value) => <span style={{ color: axis }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    case 'radar': {
      const firstDs = data.datasets[0];
      const radarData = data.labels.map((label, i) => ({
        subject: label,
        value: firstDs.data[i] ?? 0,
        fullMark: Math.max(...firstDs.data) * 1.2,
      }));
      return (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke={grid} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: axis, fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: axis, fontSize: 9 }} axisLine={false} />
            <Radar
              name={firstDs.label || 'Value'}
              dataKey="value"
              stroke={firstDs.borderColor || ECO_COLORS[0]}
              fill={firstDs.borderColor || ECO_COLORS[0]}
              fillOpacity={0.25}
              strokeWidth={2}
              isAnimationActive
            />
            <Tooltip content={tooltipContent} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    default:
      return null;
  }
};

export default ChartComponent;