import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  trend,
}) => {
  const variantStyles = {
    primary: {
      bg: 'bg-primary-50 text-primary-900 border-primary-100',
      iconBg: 'bg-primary-900 text-white',
      accent: 'border-l-primary-900',
    },
    secondary: {
      bg: 'bg-blue-50 text-blue-900 border-blue-100',
      iconBg: 'bg-secondary text-white',
      accent: 'border-l-secondary',
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      accent: 'border-l-emerald-600',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-900 border-amber-100',
      iconBg: 'bg-amber-500 text-white',
      accent: 'border-l-amber-500',
    },
    danger: {
      bg: 'bg-red-50 text-red-900 border-red-100',
      iconBg: 'bg-red-600 text-white',
      accent: 'border-l-red-600',
    },
  }[variant];

  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden",
      "border-l-4",
      variantStyles.accent
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl shadow-sm", variantStyles.iconBg)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

