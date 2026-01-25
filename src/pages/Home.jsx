import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import IssueCard from '../components/cards/IssueCard';
import IssueFilterBar from '../components/filters/IssueFilterBar';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Loader2 } from 'lucide-react';
import { isPast, isWithinInterval, subDays } from 'date-fns';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filters, setFilters] = useState({
    state: 'all',
    category: 'all',
    status: 'all',
    time: 'all',
    sort: 'latest'
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    setShowOnboarding(true);
  }, []);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 200)
  });

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaders'],
    queryFn: () => base44.entities.Leader.list()
  });

  // Filter and sort issues
  const filteredIssues = React.useMemo(() => {
    let filtered = [...issues];

    // State filter
    if (filters.state !== 'all') {
      filtered = filtered.filter(i => i.state === filters.state);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(i => i.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(i => i.status === filters.status);
    }

    // Time filter
    if (filters.time !== 'all') {
      const now = new Date();
      filtered = filtered.filter(i => {
        const createdDate = new Date(i.created_date);
        if (filters.time === 'today') {
          return isWithinInterval(createdDate, { start: subDays(now, 1), end: now });
        } else if (filters.time === '7days') {
          return isWithinInterval(createdDate, { start: subDays(now, 7), end: now });
        } else if (filters.time === '30days') {
          return isWithinInterval(createdDate, { start: subDays(now, 30), end: now });
        }
        return true;
      });
    }

    // Sort
    switch (filters.sort) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case 'proximity':
        // High Proximity Neglect: overdue + high severity + high engagement
        filtered.sort((a, b) => {
          const aOverdue = a.sla_deadline && isPast(new Date(a.sla_deadline)) && a.status !== 'Resolved';
          const bOverdue = b.sla_deadline && isPast(new Date(b.sla_deadline)) && b.status !== 'Resolved';
          const aScore = (aOverdue ? 100 : 0) + (a.severity === 'Critical' ? 50 : a.severity === 'High' ? 30 : 0) + (a.vouch_count || 0) * 5;
          const bScore = (bOverdue ? 100 : 0) + (b.severity === 'Critical' ? 50 : b.severity === 'High' ? 30 : 0) + (b.vouch_count || 0) * 5;
          return bScore - aScore;
        });
        break;
      case 'ignored':
        // Most Ignored: least engagement, oldest first
        filtered.sort((a, b) => {
          const aEngagement = (a.vouch_count || 0) + (a.repost_count || 0);
          const bEngagement = (b.vouch_count || 0) + (b.repost_count || 0);
          if (aEngagement !== bEngagement) return aEngagement - bEngagement;
          return new Date(a.created_date) - new Date(b.created_date);
        });
        break;
      case 'active':
        // Most Active: highest engagement
        filtered.sort((a, b) => {
          const aEngagement = (a.vouch_count || 0) + (a.repost_count || 0) * 2;
          const bEngagement = (b.vouch_count || 0) + (b.repost_count || 0) * 2;
          return bEngagement - aEngagement;
        });
        break;
      case 'urgent':
        // Most Urgent: critical + high severity + approaching SLA
        filtered.sort((a, b) => {
          const getSeverityScore = (s) => s === 'Critical' ? 4 : s === 'High' ? 3 : s === 'Medium' ? 2 : 1;
          return getSeverityScore(b.severity) - getSeverityScore(a.severity);
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [issues, filters]);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.scrollHeight / filteredIssues.length;
    const newIndex = Math.round(scrollPosition / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredIssues.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Compact Filter Bar */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-emerald-100 px-4 py-3">
          <IssueFilterBar filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Single Post Feed */}
        <div 
          className="h-[calc(100vh-140px)] overflow-y-auto scroll-smooth snap-y snap-mandatory"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="h-full flex items-center justify-center px-6">
              <div className="text-center">
                <p className="text-emerald-600 mb-2 text-lg">No issues found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            filteredIssues.map((issue, index) => (
              <div 
                key={issue.id} 
                className="min-h-[calc(100vh-140px)] snap-start flex items-center justify-center p-6"
              >
                <div className="w-full max-w-xl">
                  <IssueCard key={issue.id} issue={issue} leaders={leaders} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scroll Indicator */}
        {filteredIssues.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            {currentIndex + 1} / {filteredIssues.length}
          </div>
        )}
      </div>
    </div>
  );
}