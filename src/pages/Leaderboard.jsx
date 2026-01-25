import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import LeaderCard from '../components/cards/LeaderCard';
import AuraScore from '../components/ui/AuraScore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Trophy,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('aura');
  const [wardFilter, setWardFilter] = useState('all');

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders'],
    queryFn: () => base44.entities.Leader.list('-aura_score', 100)
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 500)
  });

  // Get unique wards
  const wards = useMemo(() => {
    const uniqueWards = [...new Set(leaders.map(l => l.ward).filter(Boolean))];
    return uniqueWards.sort();
  }, [leaders]);

  // Filter and sort leaders
  const filteredLeaders = useMemo(() => {
    let result = [...leaders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.name?.toLowerCase().includes(query) ||
        l.title?.toLowerCase().includes(query) ||
        l.ward?.toLowerCase().includes(query)
      );
    }

    // Ward filter
    if (wardFilter !== 'all') {
      result = result.filter(l => l.ward === wardFilter);
    }

    // Sort
    switch (sortBy) {
      case 'aura':
        result.sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0));
        break;
      case 'resolved':
        result.sort((a, b) => (b.issues_resolved || 0) - (a.issues_resolved || 0));
        break;
      case 'sla':
        result.sort((a, b) => (b.sla_compliance_rate || 0) - (a.sla_compliance_rate || 0));
        break;
      default:
        break;
    }

    return result;
  }, [leaders, searchQuery, wardFilter, sortBy]);

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalResolved = leaders.reduce((sum, l) => sum + (l.issues_resolved || 0), 0);
    const avgAura = leaders.length > 0 
      ? Math.round(leaders.reduce((sum, l) => sum + (l.aura_score || 0), 0) / leaders.length)
      : 0;
    const avgSLA = leaders.length > 0
      ? Math.round(leaders.reduce((sum, l) => sum + (l.sla_compliance_rate || 0), 0) / leaders.length)
      : 0;
    
    return { totalLeaders: leaders.length, totalResolved, avgAura, avgSLA };
  }, [leaders]);

  // Top 3 podium
  const topThree = filteredLeaders.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEEBFA] to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#29136C] via-[#4729A3] to-[#8B70DB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Leader Aura Board</h1>
              <p className="text-white/70">Data-driven accountability rankings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Total Leaders</p>
              <p className="text-3xl font-bold">{stats.totalLeaders}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Issues Resolved</p>
              <p className="text-3xl font-bold">{stats.totalResolved}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Average Aura</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                {stats.avgAura > 0 ? '+' : ''}{stats.avgAura}
                {stats.avgAura > 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : stats.avgAura < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                ) : null}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">Avg SLA Compliance</p>
              <p className="text-3xl font-bold">{stats.avgSLA}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search leaders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map(ward => (
                  <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <BarChart3 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aura">Aura Score</SelectItem>
                <SelectItem value="resolved">Issues Resolved</SelectItem>
                <SelectItem value="sla">SLA Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Podium for Top 3 */}
        {topThree.length >= 3 && !searchQuery && wardFilter === 'all' && (
          <div className="mb-12">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 mb-2 w-36 text-center">
                  {topThree[1].profile_photo ? (
                    <img 
                      src={topThree[1].profile_photo} 
                      alt={topThree[1].name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 ring-4 ring-gray-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                      {topThree[1].name?.charAt(0)}
                    </div>
                  )}
                  <p className="font-bold text-[#29136C] text-sm truncate">{topThree[1].name}</p>
                  <p className="text-xs text-gray-500 truncate">{topThree[1].ward}</p>
                  <AuraScore score={topThree[1].aura_score} showLabel={false} />
                </div>
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-24 h-20 rounded-t-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-yellow-400 mb-2 w-40 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-3xl">👑</span>
                  </div>
                  {topThree[0].profile_photo ? (
                    <img 
                      src={topThree[0].profile_photo} 
                      alt={topThree[0].name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2 ring-4 ring-yellow-400 mt-2"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-2 mt-2">
                      {topThree[0].name?.charAt(0)}
                    </div>
                  )}
                  <p className="font-bold text-[#29136C] truncate">{topThree[0].name}</p>
                  <p className="text-xs text-gray-500 truncate">{topThree[0].ward}</p>
                  <AuraScore score={topThree[0].aura_score} showLabel={false} />
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 w-28 h-28 rounded-t-xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-300 mb-2 w-36 text-center">
                  {topThree[2].profile_photo ? (
                    <img 
                      src={topThree[2].profile_photo} 
                      alt={topThree[2].name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 ring-4 ring-amber-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                      {topThree[2].name?.charAt(0)}
                    </div>
                  )}
                  <p className="font-bold text-[#29136C] text-sm truncate">{topThree[2].name}</p>
                  <p className="text-xs text-gray-500 truncate">{topThree[2].ward}</p>
                  <AuraScore score={topThree[2].aura_score} showLabel={false} />
                </div>
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 w-24 h-16 rounded-t-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Leaders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : filteredLeaders.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No leaders found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeaders.slice(searchQuery || wardFilter !== 'all' ? 0 : 3).map((leader, index) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LeaderCard 
                  leader={leader} 
                  rank={searchQuery || wardFilter !== 'all' ? index + 1 : index + 4} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}