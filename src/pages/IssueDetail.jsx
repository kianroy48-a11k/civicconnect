import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusBadge, SeverityBadge, CategoryBadge } from '../components/ui/StatusBadge';
import AuraScore from '../components/ui/AuraScore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  Users, 
  Repeat2, 
  AlertTriangle,
  CheckCircle,
  Camera,
  ArrowLeft,
  ThumbsUp,
  Share2,
  MessageSquare,
  Loader2,
  Calendar,
  User,
  UserPlus
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, differenceInHours } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function IssueDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const issueId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [verifyType, setVerifyType] = useState('Exists');
  const [verifyComment, setVerifyComment] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const issues = await base44.entities.Issue.filter({ id: issueId });
      return issues[0];
    },
    enabled: !!issueId
  });

  const { data: verifications = [] } = useQuery({
    queryKey: ['verifications', issueId],
    queryFn: () => base44.entities.Verification.filter({ issue_id: issueId }),
    enabled: !!issueId
  });

  const { data: reposts = [] } = useQuery({
    queryKey: ['reposts', issueId],
    queryFn: () => base44.entities.Repost.filter({ issue_id: issueId }),
    enabled: !!issueId
  });

  const { data: leader } = useQuery({
    queryKey: ['leader', issue?.assigned_leader_id],
    queryFn: async () => {
      if (!issue?.assigned_leader_id) return null;
      const leaders = await base44.entities.Leader.filter({ id: issue.assigned_leader_id });
      return leaders[0];
    },
    enabled: !!issue?.assigned_leader_id
  });

  const { data: allLeaders = [] } = useQuery({
    queryKey: ['leaders'],
    queryFn: () => base44.entities.Leader.list()
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Verification.create({
        issue_id: issueId,
        user_email: user?.email,
        confirmation_type: verifyType,
        comment: verifyComment
      });
      
      // Update vouch count
      await base44.entities.Issue.update(issueId, {
        vouch_count: (issue.vouch_count || 0) + 1,
        civic_pulse_score: (issue.civic_pulse_score || 0) + 5,
        status: verifyType === 'Resolved' && verifications.filter(v => v.confirmation_type === 'Resolved').length >= 2
          ? 'Resolved'
          : (issue.vouch_count || 0) >= 3 && issue.status === 'Reported'
            ? 'Verified'
            : issue.status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['issue', issueId]);
      queryClient.invalidateQueries(['verifications', issueId]);
      setShowVerifyForm(false);
      setVerifyComment('');
    }
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      // Check cooldown
      const userReposts = reposts.filter(r => r.user_email === user?.email);
      const recentRepost = userReposts.find(r => 
        differenceInHours(new Date(), new Date(r.created_date)) < 24
      );
      
      if (recentRepost) {
        throw new Error('You can only repost once every 24 hours');
      }

      await base44.entities.Repost.create({
        issue_id: issueId,
        user_email: user?.email
      });

      await base44.entities.Issue.update(issueId, {
        repost_count: (issue.repost_count || 0) + 1,
        civic_pulse_score: (issue.civic_pulse_score || 0) + 10
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['issue', issueId]);
      queryClient.invalidateQueries(['reposts', issueId]);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const hasReposted = user && reposts.some(r => r.user_email === user?.email);

  const assignMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Issue.update(issueId, {
        assigned_leader_id: selectedLeaderId,
        status: issue.status === 'Reported' ? 'Verified' : issue.status
      });

      // Update leader stats
      const assignedLeader = allLeaders.find(l => l.id === selectedLeaderId);
      if (assignedLeader) {
        await base44.entities.Leader.update(selectedLeaderId, {
          issues_assigned: (assignedLeader.issues_assigned || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['issue', issueId]);
      queryClient.invalidateQueries(['leader', selectedLeaderId]);
      setShowAssignForm(false);
      setSelectedLeaderId('');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4729A3]" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Issue not found</h2>
          <Link to={createPageUrl('Home')}>
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOverdue = issue.sla_deadline && isPast(new Date(issue.sla_deadline)) && issue.status !== 'Resolved';
  const hoursUntilSLA = issue.sla_deadline 
    ? differenceInHours(new Date(issue.sla_deadline), new Date())
    : null;

  return (
    <div className="min-h-screen bg-[#EEEBFA] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-[#4729A3] hover:text-[#29136C] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Hero Image */}
          {issue.photo && (
            <div className="relative h-64 md:h-96">
              <img 
                src={issue.photo} 
                alt={issue.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {isOverdue && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                  SLA OVERDUE
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <CategoryBadge category={issue.category} />
                  <SeverityBadge severity={issue.severity} />
                  <StatusBadge status={issue.status} />
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Title & Meta */}
            <div className="mb-6">
              {!issue.photo && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <CategoryBadge category={issue.category} />
                  <SeverityBadge severity={issue.severity} />
                  <StatusBadge status={issue.status} />
                  {isOverdue && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      SLA Overdue
                    </span>
                  )}
                </div>
              )}
              
              <h1 className="text-2xl md:text-3xl font-bold text-[#29136C] mb-3">
                {issue.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(issue.created_date), 'PPP')}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {issue.is_anonymous ? 'Anonymous' : issue.reporter_name || 'Community Member'}
                </span>
                {issue.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {issue.address}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {issue.description && (
              <div className="prose prose-gray max-w-none mb-6">
                <p className="text-gray-600 leading-relaxed">{issue.description}</p>
              </div>
            )}

            {/* Tags */}
            {issue.tags && issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {issue.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-[#4729A3]/10 text-[#4729A3] rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* SLA Timer */}
            {issue.sla_deadline && issue.status !== 'Resolved' && (
              <div className={cn(
                "p-4 rounded-xl mb-6",
                isOverdue 
                  ? "bg-red-50 border border-red-200" 
                  : hoursUntilSLA < 12
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-blue-50 border border-blue-200"
              )}>
                <div className="flex items-center gap-3">
                  <Clock className={cn(
                    "w-6 h-6",
                    isOverdue ? "text-red-500" : hoursUntilSLA < 12 ? "text-orange-500" : "text-blue-500"
                  )} />
                  <div>
                    <p className={cn(
                      "font-semibold",
                      isOverdue ? "text-red-700" : hoursUntilSLA < 12 ? "text-orange-700" : "text-blue-700"
                    )}>
                      {isOverdue 
                        ? `Overdue by ${Math.abs(hoursUntilSLA)} hours`
                        : `${hoursUntilSLA} hours until SLA deadline`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      Deadline: {format(new Date(issue.sla_deadline), 'PPp')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Meme */}
            {issue.meme && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Attached Meme 😎</p>
                <img 
                  src={issue.meme} 
                  alt="Meme" 
                  className="max-w-sm rounded-xl border border-gray-200"
                />
              </div>
            )}

            {/* Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-100">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#4729A3]">{issue.vouch_count || 0}</p>
                  <p className="text-xs text-gray-500">Vouches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#4729A3]">{issue.repost_count || 0}</p>
                  <p className="text-xs text-gray-500">Reposts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#4729A3]">{issue.civic_pulse_score || 0}</p>
                  <p className="text-xs text-gray-500">Pulse Score</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVerifyForm(true)}
                  disabled={!user}
                  className="gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Verify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => repostMutation.mutate()}
                  disabled={!user || repostMutation.isPending || issue.status === 'Resolved'}
                  className={cn(
                    "gap-2",
                    hasReposted 
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100" 
                      : ""
                  )}
                >
                  {repostMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Repeat2 className="w-4 h-4" />
                  )}
                  Repost
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.share?.({
                      title: issue.title,
                      url: window.location.href
                    });
                  }}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Verify Form */}
            {showVerifyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-gray-50 rounded-xl"
              >
                <h3 className="font-semibold text-gray-700 mb-3">Verify this Issue</h3>
                <div className="flex gap-2 mb-3">
                  <Button
                    variant={verifyType === 'Exists' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerifyType('Exists')}
                    className={verifyType === 'Exists' ? 'bg-[#4729A3]' : ''}
                  >
                    Issue Exists
                  </Button>
                  <Button
                    variant={verifyType === 'Resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVerifyType('Resolved')}
                    className={verifyType === 'Resolved' ? 'bg-emerald-600' : ''}
                  >
                    Issue Resolved
                  </Button>
                </div>
                <Textarea
                  placeholder="Optional comment..."
                  value={verifyComment}
                  onChange={(e) => setVerifyComment(e.target.value)}
                  className="mb-3"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowVerifyForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending}
                    className="bg-[#4729A3]"
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Assigned Leader */}
            {leader ? (
              <div className="mt-6 p-4 bg-[#4729A3]/5 rounded-xl border border-[#4729A3]/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#29136C]">Assigned Official</h3>
                  {user?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAssignForm(true)}
                      className="text-[#4729A3]"
                    >
                      Reassign
                    </Button>
                  )}
                </div>
                <Link to={createPageUrl(`LeaderProfile?id=${leader.id}`)} className="flex items-center gap-4 hover:bg-[#4729A3]/5 p-2 rounded-lg transition-colors">
                  {leader.profile_photo ? (
                    <img 
                      src={leader.profile_photo} 
                      alt={leader.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#4729A3] flex items-center justify-center text-white font-bold">
                      {leader.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-[#29136C]">{leader.name}</p>
                    <p className="text-sm text-gray-500">{leader.title} • {leader.ward}</p>
                  </div>
                  <AuraScore score={leader.aura_score} />
                </Link>
              </div>
            ) : user?.role === 'admin' && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignForm(true)}
                  className="w-full gap-2 border-[#4729A3]/30 text-[#4729A3] hover:bg-[#4729A3]/10"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign to Leader
                </Button>
              </div>
            )}

            {/* Assignment Form */}
            {showAssignForm && user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-gray-50 rounded-xl border border-[#4729A3]/20"
              >
                <h3 className="font-semibold text-gray-700 mb-3">Assign Issue to Leader</h3>
                <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                  <SelectTrigger className="w-full mb-3">
                    <SelectValue placeholder="Select a leader..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allLeaders.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} - {l.title} ({l.ward})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowAssignForm(false);
                      setSelectedLeaderId('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => assignMutation.mutate()}
                    disabled={!selectedLeaderId || assignMutation.isPending}
                    className="bg-[#4729A3]"
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Verifications Timeline */}
            {verifications.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-[#29136C] mb-4">Community Verifications ({verifications.length})</h3>
                <div className="space-y-3">
                  {verifications.map((v) => (
                    <div key={v.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={cn(
                        "p-2 rounded-full",
                        v.confirmation_type === 'Resolved' ? "bg-emerald-100" : "bg-blue-100"
                      )}>
                        {v.confirmation_type === 'Resolved' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ThumbsUp className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{v.confirmation_type === 'Resolved' ? 'Confirmed resolved' : 'Confirmed exists'}</span>
                        </p>
                        {v.comment && <p className="text-sm text-gray-500 mt-1">{v.comment}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(v.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}