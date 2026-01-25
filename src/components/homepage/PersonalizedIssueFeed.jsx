import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Flame, ThumbsUp, Clock, CheckCircle } from 'lucide-react';
import IssueCard from '../cards/IssueCard';

const FILTER_OPTIONS = [
  { value: 'ignored', label: 'Most Ignored', icon: Clock },
  { value: 'supported', label: 'Most Supported', icon: ThumbsUp },
  { value: 'resolved', label: 'Recently Resolved', icon: CheckCircle },
  { value: 'urgent', label: 'Most Urgent', icon: Flame }
];

export default function PersonalizedIssueFeed({ issues, locality }) {
  const [activeFilter, setActiveFilter] = useState('ignored');

  const filteredIssues = useMemo(() => {
    let filtered = locality 
      ? issues.filter(i => i.city === locality || i.locality === locality)
      : issues;

    switch (activeFilter) {
      case 'ignored':
        return [...filtered]
          .sort((a, b) => {
            const aEng = (a.vouch_count || 0) + (a.repost_count || 0);
            const bEng = (b.vouch_count || 0) + (b.repost_count || 0);
            if (aEng !== bEng) return aEng - bEng;
            return new Date(a.created_date) - new Date(b.created_date);
          })
          .slice(0, 6);
      case 'supported':
        return [...filtered]
          .sort((a, b) => (b.vouch_count || 0) - (a.vouch_count || 0))
          .slice(0, 6);
      case 'resolved':
        return filtered
          .filter(i => i.status === 'Resolved')
          .sort((a, b) => new Date(b.resolved_date || b.updated_date) - new Date(a.resolved_date || a.updated_date))
          .slice(0, 6);
      case 'urgent':
        return [...filtered]
          .filter(i => i.status !== 'Resolved')
          .sort((a, b) => {
            const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
            return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
          })
          .slice(0, 6);
      default:
        return filtered.slice(0, 6);
    }
  }, [issues, locality, activeFilter]);

  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Issues in Your Area
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Filtered for {locality || 'all locations'}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {FILTER_OPTIONS.map(filter => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  activeFilter === filter.value
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Issue Grid */}
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <IssueCard issue={issue} compact />
            </motion.div>
          ))}
        </motion.div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No issues found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}