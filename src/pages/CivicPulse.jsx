import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import IssueCard from '../components/cards/IssueCard';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  Users,
  Filter,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { isPast, differenceInHours } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CivicPulse() {
  const [filter, setFilter] = useState('trending');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 200)
  });

  // Calculate dynamic pulse scores
  const processedIssues = useMemo(() => {
    return issues
      .filter(issue => issue.status !== 'Resolved')
      .map(issue => {
        const isOverdue = issue.sla_deadline && isPast(new Date(issue.sla_deadline));
        const hoursOpen = differenceInHours(new Date(), new Date(issue.created_date));
        
        // Pulse score calculation
        let pulseScore = issue.civic_pulse_score || 0;
        
        // Urgency bonus
        if (isOverdue) pulseScore += 30;
        
        // Severity multiplier
        const severityMult = { Low: 1, Medium: 1.5, High: 2, Critical: 3 }[issue.severity] || 1;
        pulseScore *= severityMult;
        
        // Engagement bonus
        pulseScore += (issue.vouch_count || 0) * 5;
        pulseScore += (issue.repost_count || 0) * 10;
        
        // Decay based on time (issues lose relevance over time unless actively engaged)
        const decayFactor = Math.max(0.5, 1 - (hoursOpen / 720)); // 720 hours = 30 days
        pulseScore *= decayFactor;
        
        return {
          ...issue,
          calculatedPulseScore: Math.round(pulseScore),
          isOverdue,
          hoursOpen
        };
      })
      .filter(issue => categoryFilter === 'all' || issue.category === categoryFilter);
  }, [issues, categoryFilter]);

  // Sort based on filter
  const sortedIssues = useMemo(() => {
    switch (filter) {
      case 'trending':
        return [...processedIssues].sort((a, b) => b.calculatedPulseScore - a.calculatedPulseScore);
      case 'urgent':
        return [...processedIssues]
          .filter(i => i.isOverdue || (i.severity === 'Critical' || i.severity === 'High'))
          .sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            return b.calculatedPulseScore - a.calculatedPulseScore;
          });
      case 'most-vouched':
        return [...processedIssues].sort((a, b) => (b.vouch_count || 0) - (a.vouch_count || 0));
      case 'most-reposted':
        return [...processedIssues].sort((a, b) => (b.repost_count || 0) - (a.repost_count || 0));
      case 'newest':
        return [...processedIssues].sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        );
      default:
        return processedIssues;
    }
  }, [processedIssues, filter]);

  // Top trending for featured section
  const topTrending = sortedIssues.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-pulse">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Civic Pulse</h1>
              <p className="text-white/70">Real-time trending civic issues</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Active Issues</p>
              <p className="text-3xl font-bold">{processedIssues.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-400">
                {processedIssues.filter(i => i.severity === 'Critical').length}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">SLA Overdue</p>
              <p className="text-3xl font-bold text-orange-400">
                {processedIssues.filter(i => i.isOverdue).length}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Total Vouches</p>
              <p className="text-3xl font-bold">
                {processedIssues.reduce((sum, i) => sum + (i.vouch_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Trending */}
        {filter === 'trending' && topTrending.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hot Right Now</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {topTrending.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {issue.calculatedPulseScore}
                  </div>
                  <IssueCard issue={issue} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1 overflow-x-auto">
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'urgent', label: 'Urgent', icon: AlertTriangle },
              { id: 'most-vouched', label: 'Most Vouched', icon: Users },
              { id: 'newest', label: 'Newest', icon: Clock }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  filter === item.id 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Garbage">🗑️ Garbage</SelectItem>
              <SelectItem value="Water">💧 Water</SelectItem>
              <SelectItem value="Road">🛣️ Road</SelectItem>
              <SelectItem value="Safety">⚠️ Safety</SelectItem>
              <SelectItem value="Other">📋 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issues Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : sortedIssues.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No issues found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIssues.slice(filter === 'trending' ? 3 : 0).map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="relative"
              >
                <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {issue.calculatedPulseScore}
                </div>
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More (placeholder) */}
        {sortedIssues.length > 12 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">
              Load More Issues
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}