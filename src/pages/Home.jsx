import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import IssueCard from '../components/cards/IssueCard';
import IssueFilterBar from '../components/filters/IssueFilterBar';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Loader2 } from 'lucide-react';
import { isPast, isWithinInterval, subDays } from 'date-fns';

export default function Home() {
  const [user, setUser] = useState(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-950">Your Civic Dashboard</h1>
            <p className="text-emerald-700 mt-1">Track and resolve community issues</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('ReportIssue')}>
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shadow-lg shadow-emerald-700/25">
                <PlusCircle className="w-5 h-5" />
                Report Issue
              </Button>
            </Link>
            <Link to={createPageUrl('IssueMap')}>
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-2">
                <MapPin className="w-5 h-5" />
                View Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <IssueFilterBar filters={filters} onFilterChange={setFilters} />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-emerald-200/50">
            <p className="text-2xl font-bold text-emerald-900">{issues.length}</p>
            <p className="text-sm text-emerald-600">Total Issues</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-200/50">
            <p className="text-2xl font-bold text-emerald-600">
              {issues.filter(i => i.status === 'Resolved').length}
            </p>
            <p className="text-sm text-emerald-600">Resolved</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-200/50">
            <p className="text-2xl font-bold text-amber-600">
              {issues.filter(i => i.status === 'In Progress').length}
            </p>
            <p className="text-sm text-emerald-600">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-200/50">
            <p className="text-2xl font-bold text-red-600">
              {issues.filter(i => i.sla_deadline && isPast(new Date(i.sla_deadline)) && i.status !== 'Resolved').length}
            </p>
            <p className="text-sm text-emerald-600">Overdue</p>
          </div>
        </div>

        {/* Issues Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-emerald-200/50">
            <p className="text-emerald-600 mb-2">No issues found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} leaders={leaders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}