import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageSquare, Share2, TrendingUp } from 'lucide-react';

export default function CommunityPressureSection({ topIssues }) {
  const [animatedCounts, setAnimatedCounts] = useState(
    topIssues.map(() => ({ votes: 0, reposts: 0 }))
  );

  useEffect(() => {
    const duration = 1500;
    const steps = 50;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedCounts(
        topIssues.map(issue => ({
          votes: Math.floor((issue.vouch_count || 0) * progress),
          reposts: Math.floor((issue.repost_count || 0) * progress)
        }))
      );

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [topIssues]);

  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Community Pressure Drives Action
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            When citizens unite, authorities respond
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {topIssues.slice(0, 3).map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight flex-1">
                  {issue.title}
                </h3>
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Votes</span>
                  </div>
                  <motion.span
                    key={animatedCounts[index]?.votes}
                    initial={{ scale: 1.5, color: '#2563EB' }}
                    animate={{ scale: 1, color: '#334155' }}
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    {animatedCounts[index]?.votes || 0}
                  </motion.span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Shares</span>
                  </div>
                  <motion.span
                    key={animatedCounts[index]?.reposts}
                    initial={{ scale: 1.5, color: '#10B981' }}
                    animate={{ scale: 1, color: '#334155' }}
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    {animatedCounts[index]?.reposts || 0}
                  </motion.span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
                  {issue.status === 'Resolved' ? '✅ Action completed' : '⏳ Authorities monitoring'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Higher engagement = Faster resolution
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Every vote, share, and comment increases visibility and priority
          </p>
        </div>
      </div>
    </div>
  );
}