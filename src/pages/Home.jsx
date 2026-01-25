import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/homepage/HeroSection';
import LiveMapSection from '../components/homepage/LiveMapSection';
import CommunityPressureSection from '../components/homepage/CommunityPressureSection';
import AccountabilityDashboard from '../components/homepage/AccountabilityDashboard';
import PersonalizedIssueFeed from '../components/homepage/PersonalizedIssueFeed';
import ClosingSection from '../components/homepage/ClosingSection';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 200)
  });

  const { data: leaders = [], isLoading: leadersLoading } = useQuery({
    queryKey: ['leaders'],
    queryFn: () => base44.entities.Leader.list()
  });

  const stats = useMemo(() => {
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const avgTime = issues.length > 0
      ? Math.round(issues.reduce((sum, i) => sum + (i.avg_resolution_time || 48), 0) / issues.length)
      : 48;

    return {
      reported: issues.length,
      resolved,
      avgTime
    };
  }, [issues]);

  const topIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => (b.vouch_count || 0) - (a.vouch_count || 0))
      .slice(0, 6);
  }, [issues]);

  const featuredIssue = useMemo(() => {
    return issues.find(i => i.status === 'In Progress') || issues[0];
  }, [issues]);

  if (issuesLoading || leadersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <HeroSection stats={stats} />
      <PersonalizedIssueFeed issues={issues} />
      <CommunityPressureSection topIssues={topIssues} />
      <AccountabilityDashboard leaders={leaders} issues={issues} />
      <LiveMapSection issues={issues} />
      <ClosingSection />
    </div>
  );
}