// components/ui/BidTicker.tsx — Live scrolling bid activity ticker
import { useState, useEffect } from 'react';
import { TrendingUp, Clock } from 'lucide-react';

export interface TickerItem {
  id: string;
  recycler: string;
  wasteType: string;
  amount: number;
  time: string;
  isNew?: boolean;
}

interface BidTickerProps {
  items: TickerItem[];
  maxItems?: number;
  /** Add new item (triggers flash animation) */
  onNewBid?: (item: TickerItem) => void;
}

export default function BidTicker({ items, maxItems }: BidTickerProps) {
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const newestId = items.length > 0 ? items[0].id : null;

  // Flash the first item on mount and whenever items change
  useEffect(() => {
    if (!newestId) return;
    setHighlighted(newestId);
    const t = setTimeout(() => setHighlighted(null), 1500);
    return () => clearTimeout(t);
  }, [newestId]);

  if (!items.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Live Bid Activity</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">{items.length} recent bids</span>
      </div>

      {/* Scrollable ticker list */}
      <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-72 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between px-4 py-2.5 transition-all duration-500
              ${highlighted === item.id ? 'animate-bid-flash' : ''}
              ${idx === 0 ? 'bg-cyan-50/60 dark:bg-cyan-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0
                ${idx === 0 ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <TrendingUp size={12} className={idx === 0 ? 'text-cyan-600' : 'text-gray-400'} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.recycler}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.wasteType}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 ml-3 flex-shrink-0">
              <span className={`text-xs font-bold tabular-nums
                ${idx === 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-700 dark:text-gray-200'}`}>
                RWF {item.amount.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Clock size={9} />
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
