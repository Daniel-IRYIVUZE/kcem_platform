// components/dashboard/StatCard.tsx

import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  change?: string;
  progress?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
};

const StatCard = ({ title, value, icon, subtitle, change, progress, color = 'gray' }: StatCardProps) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600',
  };

  const bgColorClasses = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    gray: 'bg-gray-100',
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bgColorClasses[color]}`}>
          <span className={colorClasses[color]}>{icon}</span>
        </div>
        {change && (
          <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-gray-700 font-medium">{title}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${bgColorClasses[color]}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
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