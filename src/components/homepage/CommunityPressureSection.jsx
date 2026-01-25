import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ThumbsUp, TrendingUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CommunityPressureSection({ topIssues }) {
  const [localLikes, setLocalLikes] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    setLocalLikes(
      topIssues.reduce((acc, issue) => {
        acc[issue.id] = issue.vouch_count || 0;
        return acc;
      }, {})
    );
  }, [topIssues]);

  const likeIssueMutation = useMutation({
    mutationFn: async (issueId) => {
      await base44.entities.Verification.create({
        issue_id: issueId,
        confirmation_type: 'Exists',
        user_email: user?.email
      });
    },
    onSuccess: (_, issueId) => {
      setLocalLikes(prev => ({
        ...prev,
        [issueId]: (prev[issueId] || 0) + 1
      }));
      setUserLikes(prev => ({
        ...prev,
        [issueId]: true
      }));
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    }
  });

  const handleLike = (issueId) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    if (!userLikes[issueId]) {
      likeIssueMutation.mutate(issueId);
    }
  };

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
                <button
                  onClick={() => handleLike(issue.id)}
                  disabled={userLikes[issue.id] || likeIssueMutation.isPending}
                  className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <ThumbsUp className={`w-4 h-4 transition-colors ${userLikes[issue.id] ? 'text-blue-600 dark:text-blue-400 fill-current' : 'text-slate-400'}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Likes</span>
                  </div>
                  <motion.span
                    key={localLikes[issue.id]}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    {localLikes[issue.id] || 0}
                  </motion.span>
                </button>
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
            Community support drives accountability
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Like issues to show your support and help authorities prioritize action
          </p>
        </div>
      </div>
    </div>
  );
}