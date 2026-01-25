import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp,
  className,
  iconColor = 'text-[#4729A3]',
  iconBg = 'bg-[#4729A3]/10'
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-[#4729A3]/10 hover:shadow-lg transition-shadow duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {trend && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            trendUp ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          )}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-[#29136C]">{value}</h3>
        <p className="text-gray-500 text-sm mt-1">{label}</p>
      </div>
    </div>
  );
}