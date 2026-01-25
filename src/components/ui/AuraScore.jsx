import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AuraScore({ score, size = 'default', showLabel = true }) {
  const normalizedScore = Math.max(-100, Math.min(100, score || 0));
  
  const getColor = () => {
    if (normalizedScore >= 50) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' };
    if (normalizedScore >= 20) return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' };
    if (normalizedScore >= 0) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' };
    if (normalizedScore >= -30) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' };
    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' };
  };

  const colors = getColor();
  const Icon = normalizedScore > 0 ? TrendingUp : normalizedScore < 0 ? TrendingDown : Minus;

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center",
          colors.light
        )}>
          <div className={cn(
            "absolute inset-2 rounded-full flex items-center justify-center",
            colors.bg
          )}>
            <span className="text-2xl font-bold text-white">
              {normalizedScore > 0 ? '+' : ''}{normalizedScore}
            </span>
          </div>
        </div>
        {showLabel && (
          <span className={cn("text-sm font-medium flex items-center gap-1", colors.text)}>
            <Icon className="w-4 h-4" />
            Aura Score
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
      colors.light
    )}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        colors.bg
      )}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <span className={cn("font-semibold", colors.text)}>
        {normalizedScore > 0 ? '+' : ''}{normalizedScore}
      </span>
      {showLabel && (
        <span className="text-xs text-gray-500">Aura</span>
      )}
    </div>
  );
}