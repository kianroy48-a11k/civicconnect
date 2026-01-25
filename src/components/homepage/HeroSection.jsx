import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LOCALITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

export default function HeroSection({ stats }) {
  const [selectedLocality, setSelectedLocality] = useState('Bangalore');
  const [animatedStats, setAnimatedStats] = useState({
    reported: 0,
    resolved: 0,
    avgTime: 0
  });

  // Animate counters
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        reported: Math.floor(stats.reported * progress),
        resolved: Math.floor(stats.resolved * progress),
        avgTime: Math.floor(stats.avgTime * progress)
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-20">
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/30" style={{
        backgroundImage: 'linear-gradient(to right, rgb(203 213 225 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(203 213 225 / 0.1) 1px, transparent 1px)',
        backgroundSize: '4rem 4rem'
      }} />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Local Problems.<br />
            Public Tracking.<br />
            <span className="text-blue-600 dark:text-blue-400">Real Outcomes.</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto">
            CivicConnect turns ignored WhatsApp complaints into trackable civic action with public accountability
          </p>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 mx-auto" />
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {animatedStats.reported.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Issues Reported</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-3 mx-auto" />
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {animatedStats.resolved.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Issues Resolved</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-3 mx-auto" />
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {animatedStats.avgTime}h
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Avg Resolution Time</div>
            </motion.div>
          </div>

          {/* Locality Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <Select value={selectedLocality} onValueChange={setSelectedLocality}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALITIES.map(locality => (
                    <SelectItem key={locality} value={locality}>{locality}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl('ReportIssue')}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                Report an Issue
              </Button>
            </Link>
            <Link to={createPageUrl('IssueMap')}>
              <Button variant="outline" className="border-2 border-slate-300 dark:border-slate-600 px-8 py-6 text-lg rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Track an Issue in My Area
              </Button>
            </Link>
            <Link to={createPageUrl('CivicPulse')}>
              <Button variant="outline" className="border-2 border-slate-300 dark:border-slate-600 px-8 py-6 text-lg rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                View Ongoing Issues
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}