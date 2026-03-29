// components/dashboard/StatCard.tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

type StatCardColor = 'cyan' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray' | 'cyan';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  /** e.g. "+12%" or "-3%" or "+7 new" */
  change?: string;
  /** 0-100 for the bottom progress bar */
  progress?: number;
  color?: StatCardColor;
  /** Optional sparkline data [72, 85, 90, 80, 95, 88, 100] */
  sparkline?: number[];
  /** Trend direction override (if change string doesn't start with + or -) */
  trend?: 'up' | 'down' | 'neutral';
};

const colorMap: Record<StatCardColor, { icon: string; iconBg: string; bar: string; spark: string; change: string }> = {
  cyan:    { icon: 'text-cyan-600 dark:text-cyan-400',    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',    bar: 'bg-cyan-500',    spark: '#06b6d4', change: 'text-cyan-600 dark:text-cyan-400' },
  blue:    { icon: 'text-blue-600 dark:text-blue-400',    iconBg: 'bg-blue-100 dark:bg-blue-900/30',    bar: 'bg-blue-500',    spark: '#3b82f6', change: 'text-blue-600 dark:text-blue-400' },
  red:     { icon: 'text-red-600 dark:text-red-400',      iconBg: 'bg-red-100 dark:bg-red-900/30',      bar: 'bg-red-500',     spark: '#ef4444', change: 'text-red-600 dark:text-red-400' },
  yellow:  { icon: 'text-amber-600 dark:text-amber-400',  iconBg: 'bg-amber-100 dark:bg-amber-900/30',  bar: 'bg-amber-500',   spark: '#f59e0b', change: 'text-amber-600 dark:text-amber-400' },
  purple:  { icon: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/30', bar: 'bg-purple-500', spark: '#a855f7', change: 'text-purple-600 dark:text-purple-400' },
  orange:  { icon: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-900/30', bar: 'bg-orange-500', spark: '#f97316', change: 'text-orange-600 dark:text-orange-400' },
  gray:    { icon: 'text-gray-600 dark:text-gray-400',    iconBg: 'bg-gray-100 dark:bg-gray-700',       bar: 'bg-gray-500',    spark: '#6b7280', change: 'text-gray-600 dark:text-gray-400' },
};

/** Numeric count-up hook */
function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return count;
}

const StatCard = ({ title, value, icon, subtitle, change, progress, color = 'cyan', sparkline, trend }: StatCardProps) => {
  const c = colorMap[color];

  // Parse numeric value for count-up
  const numericRaw = typeof value === 'number' ? value
    : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const prefix = typeof value === 'string' ? String(value).match(/^[^0-9]*/)?.[0] ?? '' : '';
  const suffix = typeof value === 'string' ? String(value).replace(/^[^0-9]*[0-9,.]+/, '') : '';
  const animated = useCountUp(numericRaw);
  const displayValue = typeof value === 'number'
    ? animated.toLocaleString()
    : `${prefix}${numericRaw >= 1000 ? animated.toLocaleString() : (animated % 1 !== 0 ? animated.toFixed(1) : animated.toString())}${suffix}`;

  // Trend detection
  const autoTrend: 'up' | 'down' | 'neutral' = trend
    ?? (change?.startsWith('+') ? 'up' : change?.startsWith('-') ? 'down' : 'neutral');

  const trendColor = autoTrend === 'up' ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20'
    : autoTrend === 'down' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    : 'text-gray-500 bg-gray-100 dark:bg-gray-800';

  const TrendIcon = autoTrend === 'up' ? ArrowUp : autoTrend === 'down' ? ArrowDown : Minus;

  const sparkData = sparkline?.map((v, i) => ({ i, v }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 overflow-hidden relative animate-fade-up">
      {/* Top row: icon + change badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${c.iconBg} animate-rotate-in`}>
          <span className={c.icon}>{icon}</span>
        </div>
        {change && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={11} />
            {change}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums tracking-tight mt-1">
        {displayValue}
      </p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-4 space-y-1">
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${c.bar} animate-progress-fill`}
              style={{ '--progress-width': `${Math.min(progress, 100)}%`, width: `${Math.min(progress, 100)}%` } as React.CSSProperties}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0</span><span>{progress}%</span><span>100</span>
          </div>
        </div>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 2 && (
        <div className="mt-3 -mx-1 opacity-70" style={{ height: 40, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Tooltip
                content={() => null}
                wrapperStyle={{ display: 'none' }}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke={c.spark}
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StatCard;