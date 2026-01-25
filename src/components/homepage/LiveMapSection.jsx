import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LiveMapSection({ issues }) {
  const validIssues = issues.filter(i => i.latitude && i.longitude);
  const statusCounts = {
    reported: issues.filter(i => i.status === 'Reported').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length
  };

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Live Civic Map
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Every pin represents a tracked issue. Explore the interactive map.
          </p>
        </div>

        <Link to={createPageUrl('IssueMap')}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
          >
            {/* Static Map Preview */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/78.9629,22.5937,4,0/1200x800@2x?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazB3MXJhbGEwMDAwM25udnVrcTR6cTZwIn0.example"
                  alt="India Map Preview"
                  className="w-full h-full object-cover opacity-40"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Overlay with stats */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm group-hover:bg-white/70 dark:group-hover:bg-slate-900/70 transition-all">
                <div className="flex flex-col items-center gap-4">
                  <MapPin className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                      {validIssues.length}
                    </div>
                    <div className="text-lg text-slate-600 dark:text-slate-400">Issues Mapped</div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-md">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{statusCounts.reported} Reported</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-md">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{statusCounts.inProgress} In Progress</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-md">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{statusCounts.resolved} Resolved</span>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                  Explore Interactive Map
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}