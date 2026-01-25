import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users } from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../ui/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  Reported: '#EF4444',
  Verified: '#F59E0B',
  'In Progress': '#F59E0B',
  Resolved: '#10B981'
};

export default function LiveMapSection({ issues }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const INDIA_CENTER = [22.5937, 78.9629];

  const validIssues = issues.filter(i => i.latitude && i.longitude);

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Live Civic Map
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Every pin represents a tracked issue. Click to see details.
          </p>
        </div>

        <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            className="h-full w-full"
            style={{ background: '#f8fafc' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {validIssues.map((issue) => (
              <CircleMarker
                key={issue.id}
                center={[issue.latitude, issue.longitude]}
                radius={8}
                pathOptions={{
                  color: STATUS_COLORS[issue.status] || '#6366F1',
                  fillColor: STATUS_COLORS[issue.status] || '#6366F1',
                  fillOpacity: 0.8,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => setSelectedIssue(issue)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-slate-900 mb-2">{issue.title}</h3>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 z-10">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-slate-700 dark:text-slate-300">Unresolved</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="text-slate-700 dark:text-slate-300">In Progress</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-slate-700 dark:text-slate-300">Resolved</span>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedIssue && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                className="absolute top-0 right-0 bottom-0 w-96 bg-white dark:bg-slate-900 shadow-2xl z-20 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Issue Details</h3>
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  
                  {selectedIssue.photo && (
                    <img 
                      src={selectedIssue.photo} 
                      alt={selectedIssue.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}

                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{selectedIssue.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{selectedIssue.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                      <StatusBadge status={selectedIssue.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Reported</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatDistanceToNow(new Date(selectedIssue.created_date), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Community Support</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {selectedIssue.vouch_count || 0} votes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{selectedIssue.address}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}