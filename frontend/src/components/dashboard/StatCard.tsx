// components/dashboard/StatCard.tsx

import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  change?: string;
  progress?: number;
  color?: 'cyan' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
};

const StatCard = ({ title, value, icon, subtitle, change, progress, color = 'gray' }: StatCardProps) => {
  const colorClasses = {
    cyan: 'text-cyan-600',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-700 dark:text-yellow-700',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-yellow-700',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  const bgColorClasses = {
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    orange: 'bg-orange-100 dark:bg-yellow-700/30',
    gray: 'bg-gray-100 dark:bg-gray-700',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bgColorClasses[color]}`}>
          <span className={colorClasses[color]}>{icon}</span>
        </div>
        {change && (
          <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-cyan-600' : 'text-red-600 dark:text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
      <p className="text-gray-700 dark:text-gray-300 font-medium">{title}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${bgColorClasses[color]}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span>{progress}%</span>
            <span>100</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;