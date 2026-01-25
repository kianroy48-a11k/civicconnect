import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const statusConfig = {
  Reported: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock
  },
  Verified: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: CheckCircle
  },
  'In Progress': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Loader2
  },
  Resolved: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle
  }
};

const severityConfig = {
  Low: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200'
  },
  Medium: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  High: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  Critical: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200'
  }
};

export function StatusBadge({ status, size = 'default' }) {
  const config = statusConfig[status] || statusConfig.Reported;
  const Icon = config.icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      config.bg, config.text, config.border,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <Icon className={cn(
        size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
        status === 'In Progress' && 'animate-spin'
      )} />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity, size = 'default' }) {
  const config = severityConfig[severity] || severityConfig.Medium;
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium",
      config.bg, config.text, config.border,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {severity}
    </span>
  );
}

export function CategoryBadge({ category, size = 'default' }) {
  const categoryIcons = {
    Garbage: '🗑️',
    Water: '💧',
    Road: '🛣️',
    Safety: '⚠️',
    Other: '📋'
  };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-[#4729A3]/10 text-[#4729A3] border border-[#4729A3]/20 font-medium",
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span>{categoryIcons[category] || '📋'}</span>
      {category}
    </span>
  );
}