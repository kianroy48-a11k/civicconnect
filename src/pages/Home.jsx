import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import IssueCard from '../components/cards/IssueCard';
import StatCard from '../components/cards/StatCard';
import AuraScore from '../components/ui/AuraScore';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  TrendingUp,
  Users,
  ArrowRight,
  Zap,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isPast } from 'date-fns';
import { motion } from 'framer-motion';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('civic_audit_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 50)
  });

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaders'],
    queryFn: () => base44.entities.Leader.list('-aura_score', 3)
  });

  const stats = React.useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const overdue = issues.filter(i => 
      i.sla_deadline && isPast(new Date(i.sla_deadline)) && i.status !== 'Resolved'
    ).length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    
    return { total, resolved, overdue, inProgress };
  }, [issues]);

  const trendingIssues = React.useMemo(() => {
    return [...issues]
      .filter(i => i.status !== 'Resolved')
      .sort((a, b) => (b.civic_pulse_score || 0) - (a.civic_pulse_score || 0))
      .slice(0, 4);
  }, [issues]);

  const highPriorityIssues = React.useMemo(() => {
    return issues
      .filter(i => 
        i.sla_deadline && 
        isPast(new Date(i.sla_deadline)) && 
        i.status !== 'Resolved'
      )
      .slice(0, 3);
  }, [issues]);

  return (
    <div className="min-h-screen">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#29136C] via-[#4729A3] to-[#8B70DB] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Data-driven civic accountability</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Voice Shapes<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Your Community
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Report issues, track progress, and hold leaders accountable through 
              transparent, community-powered civic engagement.
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <Link to={createPageUrl('ReportIssue')} className="w-full max-w-md">
                <Button size="lg" className="w-full bg-white text-[#4729A3] hover:bg-white/90 font-bold px-16 py-7 text-2xl h-auto shadow-2xl hover:shadow-white/25 transition-all duration-300">
                  <AlertTriangle className="w-14 h-14 mr-3" />
                  Report an Issue
                </Button>
              </Link>
              <Link to={createPageUrl('IssueMap')}>
                <Button size="lg" className="bg-[#4729A3] text-white hover:bg-[#29136C] border-2 border-white/30 font-semibold px-8 h-auto py-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  View Map
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard 
              icon={AlertTriangle}
              label="Total Issues"
              value={stats.total}
              iconColor="text-[#4729A3]"
              iconBg="bg-[#4729A3]/10"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard 
              icon={CheckCircle}
              label="Resolved"
              value={stats.resolved}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard 
              icon={Clock}
              label="In Progress"
              value={stats.inProgress}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <StatCard 
              icon={Flame}
              label="SLA Overdue"
              value={stats.overdue}
              iconColor="text-red-600"
              iconBg="bg-red-100"
            />
          </motion.div>
        </div>
      </section>

      {/* High Priority Neglect Section */}
      {highPriorityIssues.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-6 md:p-8 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">High-Priority Neglect</h2>
                <p className="text-red-600 text-sm">Issues that have exceeded their SLA deadline</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {highPriorityIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Issues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#4729A3]/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#4729A3]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29136C]">Civic Pulse</h2>
              <p className="text-gray-500">Trending issues in your community</p>
            </div>
          </div>
          <Link to={createPageUrl('CivicPulse')}>
            <Button variant="ghost" className="text-[#4729A3] hover:bg-[#4729A3]/10">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {issuesLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Top Leaders */}
      {leaders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#4729A3]/10 rounded-xl">
                <Users className="w-6 h-6 text-[#4729A3]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#29136C]">Top Performers</h2>
                <p className="text-gray-500">Leaders with highest Aura scores</p>
              </div>
            </div>
            <Link to={createPageUrl('Leaderboard')}>
              <Button variant="ghost" className="text-[#4729A3] hover:bg-[#4729A3]/10">
                Full Leaderboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {leaders.map((leader, index) => (
              <Link
                key={leader.id}
                to={createPageUrl(`LeaderProfile?id=${leader.id}`)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-[#4729A3]/10 hover:shadow-xl hover:border-[#4729A3]/30 transition-all duration-300 cursor-pointer"
                >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {leader.profile_photo ? (
                      <img 
                        src={leader.profile_photo} 
                        alt={leader.name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-[#4729A3]/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4729A3] to-[#8B70DB] flex items-center justify-center text-white text-2xl font-bold">
                        {leader.name?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#29136C]">{leader.name}</h3>
                    <p className="text-sm text-gray-500">{leader.title}</p>
                    <p className="text-xs text-[#4729A3]">{leader.ward}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <AuraScore score={leader.aura_score} />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{leader.issues_resolved || 0}</p>
                    <p className="text-xs text-gray-500">Issues Resolved</p>
                  </div>
                  </div>
                  </motion.div>
                  </Link>
                  ))}
                  </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-[#4729A3] to-[#8B70DB] rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See Something? Say Something.
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Every report makes a difference. Join thousands of citizens building 
            a more transparent and accountable community.
          </p>
          <Link to={createPageUrl('ReportIssue')}>
            <Button size="lg" className="bg-white text-[#4729A3] hover:bg-white/90 font-semibold px-12">
              Report Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}