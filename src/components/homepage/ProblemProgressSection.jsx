import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProblemProgressSection() {
  const [activeView, setActiveView] = useState('before'); // before or after

  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            From Chaos to Clarity
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            See how CivicConnect transforms unstructured complaints into actionable civic data
          </p>
        </div>

        {/* Toggle Control */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActiveView('before')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'before'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Before CivicConnect
            </button>
            <button
              onClick={() => setActiveView('after')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'after'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              After CivicConnect
            </button>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <AnimatePresence mode="wait">
            {activeView === 'before' ? (
              <motion.div
                key="before"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-6 h-6 text-slate-500" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">WhatsApp Complaint</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      "Sir pls look into the garbage issue near MG Road junction. It's been 2 weeks nobody came 🙏"
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                    <div className="flex items-center gap-2">
                      ❌ No tracking number
                    </div>
                    <div className="flex items-center gap-2">
                      ❌ No accountability
                    </div>
                    <div className="flex items-center gap-2">
                      ❌ No public visibility
                    </div>
                    <div className="flex items-center gap-2">
                      ❌ No follow-up mechanism
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="after"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-800 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Garbage Overflow - MG Road</h3>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full">
                    In Progress
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Days Open</span>
                    <span className="font-semibold text-slate-900 dark:text-white">3 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Assigned To</span>
                    <span className="font-semibold text-slate-900 dark:text-white">BBMP Ward 42</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Community Votes</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">127 supporters</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Work scheduled for Jan 28</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow or explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="text-center">
              <ArrowRight className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Structured. Trackable. Accountable.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Every issue gets a unique ID, public visibility,<br />
                and automatic escalation timelines
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}