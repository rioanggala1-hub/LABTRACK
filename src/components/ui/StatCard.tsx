import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'cyan' | 'success' | 'warning' | 'danger';
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
      border: 'border-slate-100 hover:border-slate-300',
      iconBg: 'bg-gradient-to-br from-[#142D4E] to-[#233E64] text-white shadow-blue-900/20',
      tagBg: 'bg-slate-100 text-slate-700',
      lightBar: 'from-[#142D4E] to-[#233E64]',
    },
    secondary: {
      border: 'border-blue-100/80 hover:border-blue-300',
      iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-blue-500/30',
      tagBg: 'bg-blue-50 text-blue-700',
      lightBar: 'from-[#2563EB] to-[#60A5FA]',
    },
    cyan: {
      border: 'border-cyan-100/80 hover:border-cyan-300',
      iconBg: 'bg-gradient-to-br from-[#06B6D4] to-[#0891B2] text-white shadow-cyan-500/30',
      tagBg: 'bg-cyan-50 text-cyan-700',
      lightBar: 'from-[#06B6D4] to-[#22D3EE]',
    },
    success: {
      border: 'border-emerald-100/80 hover:border-emerald-300',
      iconBg: 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-emerald-500/30',
      tagBg: 'bg-emerald-50 text-emerald-700',
      lightBar: 'from-[#10B981] to-[#34D399]',
    },
    warning: {
      border: 'border-amber-100/80 hover:border-amber-300',
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white shadow-amber-500/30',
      tagBg: 'bg-amber-50 text-amber-700',
      lightBar: 'from-[#F59E0B] to-[#FBBF24]',
    },
    danger: {
      border: 'border-red-100/80 hover:border-red-300',
      iconBg: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white shadow-red-500/30',
      tagBg: 'bg-red-50 text-red-700',
      lightBar: 'from-[#EF4444] to-[#F87171]',
    },
  }[variant];

  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl p-6 border shadow-[0_4px_20px_-2px_rgba(20,45,78,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(20,45,78,0.1)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden",
        variantStyles.border
      )}
    >
      {/* Top subtle highlight gradient line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-90 transition-opacity",
          variantStyles.lightBar
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
            {value}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend.value}
              </span>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Icon box with gradient & subtle shadow */}
        <div
          className={cn(
            "p-3.5 rounded-2xl shadow-lg ring-4 ring-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300",
            variantStyles.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
