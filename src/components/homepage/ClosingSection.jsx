import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function ClosingSection() {
  return (
    <div className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            CivicConnect is not about complaints.<br />
            It's about <span className="text-blue-200">closing the loop</span> between citizens and power.
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Every issue tracked. Every official measured. Every voice amplified.
          </p>

          {/* Final CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl('ReportIssue')}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Tracking Issues
              </Button>
            </Link>
            <Link to={createPageUrl('Leaderboard')}>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl transition-all">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Accountability Dashboard
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-blue-200">Transparency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Public</div>
              <div className="text-sm text-blue-200">Data Access</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Real</div>
              <div className="text-sm text-blue-200">Outcomes</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}