// components/ui/EcoImpactPanel.tsx — Real-time environmental impact metrics
import { Leaf, TreePine, Droplets, Zap, Globe } from 'lucide-react';
import { LiveCounter } from './LiveCounter';

interface EcoMetric {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  decimals?: number;
}

interface EcoImpactPanelProps {
  co2Saved: number;      // metric tons
  wasteDiverted: number; // kg
  waterSaved?: number;   // liters
  energySaved?: number;  // kWh
  className?: string;
}

export default function EcoImpactPanel({
  co2Saved, wasteDiverted, waterSaved = 0, energySaved = 0, className = '',
}: EcoImpactPanelProps) {
  const treesEquivalent = Math.round(co2Saved * 45);

  const metrics: EcoMetric[] = [
    {
      icon: <Leaf size={20} />,
      label: 'CO₂ Avoided',
      value: co2Saved,
      unit: 't',
      color: '#10b981',
      decimals: 1,
    },
    {
      icon: <TreePine size={20} />,
      label: 'Trees Equivalent',
      value: treesEquivalent,
      unit: '',
      color: '#0f89ab',
    },
    {
      icon: <Globe size={20} />,
      label: 'Waste Diverted',
      value: wasteDiverted,
      unit: ' kg',
      color: '#0891b2',
    },
    ...(waterSaved > 0 ? [{
      icon: <Droplets size={20} />,
      label: 'Water Saved',
      value: waterSaved,
      unit: ' L',
      color: '#3b82f6',
    }] : []),
    ...(energySaved > 0 ? [{
      icon: <Zap size={20} />,
      label: 'Energy Saved',
      value: energySaved,
      unit: ' kWh',
      color: '#f59e0b',
    }] : []),
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-cyan-200 dark:border-cyan-900/40 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
          <Leaf size={16} className="text-cyan-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Environmental Impact</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="live-dot" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Live metrics</span>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${metrics.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col items-center py-3 px-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-center animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-9 h-9 flex items-center justify-center rounded-full mb-2"
              style={{ background: m.color + '1a' }}>
              <span style={{ color: m.color }}>{m.icon}</span>
            </div>
            <p className="text-xl font-extrabold tabular-nums" style={{ color: m.color }}>
              <LiveCounter value={m.value} suffix={m.unit} decimals={m.decimals} />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
