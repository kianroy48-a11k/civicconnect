import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { differenceInMonths, subMonths, isAfter } from 'date-fns';

export default function AccountabilityDashboard({ leaders, issues }) {
  const [timeRange, setTimeRange] = useState('6months');

  const filteredData = useMemo(() => {
    const cutoffDate = timeRange === '6months' 
      ? subMonths(new Date(), 6) 
      : subMonths(new Date(), 3);

    const recentIssues = issues.filter(i => 
      isAfter(new Date(i.created_date), cutoffDate)
    );

    return leaders.slice(0, 5).map(leader => {
      const leaderIssues = recentIssues.filter(i => i.assigned_leader_id === leader.id);
      const resolved = leaderIssues.filter(i => i.status === 'Resolved').length;
      const total = leaderIssues.length;
      
      return {
        name: leader.name.split(' ')[0],
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgTime: leader.avg_resolution_time || 0,
        unresolved: total - resolved
      };
    });
  }, [leaders, issues, timeRange]);

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Accountability That Carries Into Elections
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Track official performance with hard data, not promises
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="preelection">Pre-Election Period</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl mb-8"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Resolution Rate by Official
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="resolutionRate" radius={[8, 8, 0, 0]}>
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.resolutionRate > 70 ? '#10B981' : entry.resolutionRate > 40 ? '#F59E0B' : '#EF4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Scorecards */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {Math.round(filteredData.reduce((sum, d) => sum + d.resolutionRate, 0) / filteredData.length)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Resolution Rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <TrendingDown className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {Math.round(filteredData.reduce((sum, d) => sum + d.avgTime, 0) / filteredData.length)}h
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {filteredData.reduce((sum, d) => sum + d.unresolved, 0)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Critical Unresolved</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}