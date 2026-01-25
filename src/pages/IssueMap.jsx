import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { StatusBadge, SeverityBadge, CategoryBadge } from '../components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MapPin, 
  Filter, 
  Layers, 
  Eye,
  Flame,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  Reported: '#3B82F6',
  Verified: '#8B70DB',
  'In Progress': '#F59E0B',
  Resolved: '#10B981'
};

const SEVERITY_MULTIPLIERS = {
  Low: 1,
  Medium: 1.5,
  High: 2,
  Critical: 3
};

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function IssueMap() {
  const INDIA_BOUNDS = [[8.4, 68.7], [35.5, 97.4]]; // India geographic boundaries
  const INDIA_CENTER = [22.5937, 78.9629]; // India center
  
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    severity: 'all'
  });
  const [viewMode, setViewMode] = useState('pins'); // pins or heatmap
  const [selectedIssue, setSelectedIssue] = useState(null);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 200)
  });

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (!issue.latitude || !issue.longitude) return false;
      if (filters.category !== 'all' && issue.category !== filters.category) return false;
      if (filters.status !== 'all' && issue.status !== filters.status) return false;
      if (filters.severity !== 'all' && issue.severity !== filters.severity) return false;
      return true;
    });
  }, [issues, filters]);

  // Calculate heatmap zones
  const heatmapZones = useMemo(() => {
    if (viewMode !== 'heatmap') return [];
    
    const zones = {};
    filteredIssues.forEach(issue => {
      // Round coordinates to create zones
      const zoneKey = `${Math.round(issue.latitude * 100) / 100}_${Math.round(issue.longitude * 100) / 100}`;
      
      if (!zones[zoneKey]) {
        zones[zoneKey] = {
          lat: issue.latitude,
          lng: issue.longitude,
          count: 0,
          vouchCount: 0,
          issues: []
        };
      }
      zones[zoneKey].count++;
      zones[zoneKey].vouchCount += (issue.vouch_count || 0);
      zones[zoneKey].issues.push(issue);
    });
    
    return Object.values(zones);
  }, [filteredIssues, viewMode]);

  const getMarkerColor = (issue) => {
    const isOverdue = issue.sla_deadline && isPast(new Date(issue.sla_deadline)) && issue.status !== 'Resolved';
    if (isOverdue) return '#E74C3C';
    return STATUS_COLORS[issue.status] || '#4729A3';
  };

  const getMarkerSize = (issue) => {
    const base = 8;
    const severityMult = SEVERITY_MULTIPLIERS[issue.severity] || 1;
    const vouchBonus = Math.min((issue.vouch_count || 0) / 5, 2);
    return base * severityMult + vouchBonus * 3;
  };

  const mapCenter = useMemo(() => {
    if (filteredIssues.length === 0) return INDIA_CENTER;
    const avgLat = filteredIssues.reduce((sum, i) => sum + i.latitude, 0) / filteredIssues.length;
    const avgLng = filteredIssues.reduce((sum, i) => sum + i.longitude, 0) / filteredIssues.length;
    return [avgLat, avgLng];
  }, [filteredIssues]);

  const stats = useMemo(() => {
    const overdue = filteredIssues.filter(i => 
      i.sla_deadline && isPast(new Date(i.sla_deadline)) && i.status !== 'Resolved'
    ).length;
    const resolved = filteredIssues.filter(i => i.status === 'Resolved').length;
    const inProgress = filteredIssues.filter(i => i.status === 'In Progress').length;
    
    return { total: filteredIssues.length, overdue, resolved, inProgress };
  }, [filteredIssues]);

  return (
    <div className="min-h-screen bg-[#EEEBFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#4729A3]/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title & Stats */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4729A3]/10 rounded-xl">
                <MapPin className="w-6 h-6 text-[#4729A3]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#29136C]">Accountability Map</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{stats.total} issues</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle className="w-3 h-3" /> {stats.resolved}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock className="w-3 h-3" /> {stats.inProgress}
                  </span>
                  {stats.overdue > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <Flame className="w-3 h-3" /> {stats.overdue} overdue
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filters.category} onValueChange={(v) => setFilters(f => ({...f, category: v}))}>
                <SelectTrigger className="w-[130px]">
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

              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({...f, status: v}))}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Reported">Reported</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('pins')}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm font-medium transition-all",
                    viewMode === 'pins' ? "bg-[#4729A3] text-white" : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Pins
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm font-medium transition-all",
                    viewMode === 'heatmap' ? "bg-[#4729A3] text-white" : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Layers className="w-4 h-4 inline mr-1" />
                  Heatmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[calc(100vh-180px)]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4729A3] border-t-transparent" />
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={6}
            className="h-full w-full z-0"
            style={{ background: '#EEEBFA' }}
            maxBounds={INDIA_BOUNDS}
            maxBoundsViscosity={1.0}
            minZoom={5}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />

            {viewMode === 'pins' ? (
              // Individual pins
              filteredIssues.map((issue) => (
                <CircleMarker
                  key={issue.id}
                  center={[issue.latitude, issue.longitude]}
                  radius={getMarkerSize(issue)}
                  pathOptions={{
                    color: getMarkerColor(issue),
                    fillColor: getMarkerColor(issue),
                    fillOpacity: 0.7,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedIssue(issue)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryBadge category={issue.category} size="sm" />
                        <SeverityBadge severity={issue.severity} size="sm" />
                      </div>
                      <h3 className="font-semibold text-[#29136C] mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{issue.description}</p>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={issue.status} size="sm" />
                        <Link to={createPageUrl(`IssueDetail?id=${issue.id}`)}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            View <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))
            ) : (
              // Heatmap zones
              heatmapZones.map((zone, idx) => {
                const intensity = Math.min(zone.vouchCount / 10, 1);
                const baseOpacity = 0.3 + intensity * 0.5;
                const radius = 20 + zone.count * 5 + zone.vouchCount * 2;
                
                return (
                  <CircleMarker
                    key={idx}
                    center={[zone.lat, zone.lng]}
                    radius={Math.min(radius, 80)}
                    pathOptions={{
                      color: `rgba(231, 76, 60, ${baseOpacity})`,
                      fillColor: `rgba(231, 76, 60, ${baseOpacity})`,
                      fillOpacity: baseOpacity,
                      weight: 0
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-red-700 mb-1">
                          <Flame className="w-4 h-4 inline mr-1" />
                          Heat Zone
                        </h3>
                        <p className="text-sm text-gray-600">{zone.count} issues</p>
                        <p className="text-sm text-gray-600">{zone.vouchCount} total vouches</p>
                        <div className="mt-2 space-y-1">
                          {zone.issues.slice(0, 3).map(issue => (
                            <Link 
                              key={issue.id}
                              to={createPageUrl(`IssueDetail?id=${issue.id}`)}
                              className="block text-xs text-[#4729A3] hover:underline"
                            >
                              • {issue.title}
                            </Link>
                          ))}
                          {zone.issues.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{zone.issues.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })
            )}
          </MapContainer>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Legend</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#E74C3C]" />
              <span>SLA Overdue</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span>Resolved</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span>Reported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}