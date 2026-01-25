import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Wrench, Trophy, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const STAGES = [
  { key: 'reported', label: 'Reported', icon: FileText },
  { key: 'acknowledged', label: 'Acknowledged', icon: CheckCircle },
  { key: 'in_progress', label: 'Work Started', icon: Wrench },
  { key: 'resolved', label: 'Resolved', icon: Trophy }
];

export default function IssueLifecycleTimeline({ issue }) {
  const getCurrentStage = () => {
    if (issue.status === 'Resolved') return 3;
    if (issue.status === 'In Progress') return 2;
    if (issue.status === 'Verified') return 1;
    return 0;
  };

  const currentStage = getCurrentStage();
  const daysOpen = differenceInDays(new Date(), new Date(issue.created_date));
  const isDelayed = daysOpen > 7 && issue.status !== 'Resolved';

  return (
    <div className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Issue Lifecycle
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Transparent tracking from report to resolution
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-10 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute top-10 left-0 h-1 bg-blue-600 dark:bg-blue-400"
          />

          {/* Stages */}
          <div className="relative grid grid-cols-4 gap-4">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index <= currentStage;
              const isCurrent = index === currentStage;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    {isCurrent && isDelayed && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <h4 className={`font-semibold mb-1 ${
                    isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'
                  }`}>
                    {stage.label}
                  </h4>
                  {isCompleted && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {index === 0 ? format(new Date(issue.created_date), 'MMM d') : 'Jan 24'}
                    </p>
                  )}
                  {isCompleted && index > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      BBMP Official
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {isDelayed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center"
          >
            <p className="text-sm text-red-800 dark:text-red-300">
              ⚠️ This issue has been open for {daysOpen} days — escalation in progress
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}