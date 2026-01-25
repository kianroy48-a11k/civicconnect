import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { StatusBadge, SeverityBadge, CategoryBadge } from '../ui/StatusBadge';
import { MapPin, Clock, Users, Repeat2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

export default function IssueCard({ issue, compact = false }) {
  const isOverdue = issue.sla_deadline && isPast(new Date(issue.sla_deadline)) && issue.status !== 'Resolved';
  const timeAgo = formatDistanceToNow(new Date(issue.created_date), { addSuffix: true });

  if (compact) {
    return (
      <Link 
        to={createPageUrl(`IssueDetail?id=${issue.id}`)}
        className="block bg-white rounded-xl p-4 border border-[#4729A3]/10 hover:border-[#4729A3]/30 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start gap-3">
          {issue.photo && (
            <img 
              src={issue.photo} 
              alt={issue.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#29136C] truncate">{issue.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <CategoryBadge category={issue.category} size="sm" />
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
          </div>
          <SeverityBadge severity={issue.severity} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl(`IssueDetail?id=${issue.id}`)}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl",
        isOverdue 
          ? "border-red-300 shadow-red-100" 
          : "border-[#4729A3]/10 hover:border-[#4729A3]/30"
      )}
    >
      {/* Image */}
      {issue.photo && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={issue.photo} 
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <CategoryBadge category={issue.category} />
            <SeverityBadge severity={issue.severity} />
          </div>
          {isOverdue && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              SLA Overdue
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {!issue.photo && (
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge category={issue.category} />
            <SeverityBadge severity={issue.severity} />
            {isOverdue && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
        )}

        <h3 className="text-lg font-bold text-[#29136C] mb-2 group-hover:text-[#4729A3] transition-colors">
          {issue.title}
        </h3>

        {issue.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <StatusBadge status={issue.status} size="sm" />
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {issue.vouch_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="w-4 h-4" />
              {issue.repost_count || 0}
            </span>
          </div>
        </div>

        {issue.address && (
          <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-[#4729A3]" />
            <span className="truncate">{issue.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {issue.is_anonymous ? 'Anonymous' : issue.reporter_name || 'Community Member'}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>
      </div>
    </Link>
  );
}