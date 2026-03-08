// components/ui/PageHeader.tsx — Consistent dashboard page header
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Breadcrumb { label: string; href?: string; }

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  badge?: string;
  badgeColor?: 'cyan' | 'cyan' | 'amber' | 'red';
}

const badgeColors = {
  cyan:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  red:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function PageHeader({
  title, subtitle, icon, actions, breadcrumbs, badge, badgeColor = 'cyan',
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 animate-fade-up">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5 animate-rotate-in">
            {icon}
          </div>
        )}
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 mb-1">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
                  {crumb.href
                    ? <Link to={crumb.href} className="text-xs text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{crumb.label}</Link>
                    : <span className="text-xs text-gray-400 dark:text-gray-500">{crumb.label}</span>
                  }
                </span>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {badge && (
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
