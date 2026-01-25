import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import IssueCard from '../components/cards/IssueCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Repeat2,
  ThumbsUp,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { data: myIssues = [] } = useQuery({
    queryKey: ['myIssues', user?.email],
    queryFn: () => base44.entities.Issue.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: myReposts = [] } = useQuery({
    queryKey: ['myReposts', user?.email],
    queryFn: () => base44.entities.Repost.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: myVerifications = [] } = useQuery({
    queryKey: ['myVerifications', user?.email],
    queryFn: () => base44.entities.Verification.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: allIssues = [] } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list()
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Please Log In</h2>
          <p className="text-gray-500 mb-4">You need to be logged in to view your profile.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-emerald-700 hover:bg-emerald-800">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const stats = {
    reported: myIssues.length,
    resolved: myIssues.filter(i => i.status === 'Resolved').length,
    inProgress: myIssues.filter(i => i.status === 'In Progress').length,
    reposts: myReposts.length,
    verifications: myVerifications.length
  };

  const repostedIssues = allIssues.filter(issue => 
    myReposts.some(repost => repost.issue_id === issue.id)
  );

  const verifiedIssues = allIssues.filter(issue =>
    myVerifications.some(v => v.issue_id === issue.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-emerald-200/50"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-emerald-950 mb-2">{user.full_name || 'User'}</h1>
              <p className="text-gray-500 mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {user.role === 'admin' ? '👑 Admin' : '👤 Citizen'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-950">{stats.reported}</p>
              <p className="text-sm text-gray-500">Reported</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-950">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-950">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Repeat2 className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-950">{stats.reposts}</p>
              <p className="text-sm text-gray-500">Reposts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <ThumbsUp className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-950">{stats.verifications}</p>
              <p className="text-sm text-gray-500">Verified</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="reported" className="space-y-6">
          <TabsList className="bg-white border border-emerald-200/50 p-1">
            <TabsTrigger value="reported" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              My Reports ({stats.reported})
            </TabsTrigger>
            <TabsTrigger value="reposts" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Reposts ({stats.reposts})
            </TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Verifications ({stats.verifications})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reported">
            {myIssues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven't reported any issues yet.</p>
                <Link to={createPageUrl('ReportIssue')}>
                  <Button className="bg-emerald-700 hover:bg-emerald-800">Report Your First Issue</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reposts">
            {repostedIssues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Repeat2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You haven't reposted any issues yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repostedIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verifications">
            {verifiedIssues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You haven't verified any issues yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {verifiedIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}