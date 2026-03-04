// components/dashboard/Widget.tsx

import type { ReactNode } from 'react';

interface DashboardWidgetProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

const DashboardWidget = ({ title, icon, children, action }: DashboardWidgetProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {action && (
            <div>{action}</div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardWidget;