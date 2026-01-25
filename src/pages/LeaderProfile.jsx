import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import IssueCard from '../components/cards/IssueCard';
import AuraScore from '../components/ui/AuraScore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Target, 
  MapPin,
  Star,
  Send,
  Loader2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LeaderProfile() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const leaderId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState([0]);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: leader, isLoading } = useQuery({
    queryKey: ['leader', leaderId],
    queryFn: async () => {
      const leaders = await base44.entities.Leader.filter({ id: leaderId });
      return leaders[0];
    },
    enabled: !!leaderId
  });

  const { data: assignedIssues = [] } = useQuery({
    queryKey: ['leaderIssues', leaderId],
    queryFn: () => base44.entities.Issue.filter({ assigned_leader_id: leaderId }),
    enabled: !!leaderId
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['leaderRatings', leaderId],
    queryFn: () => base44.entities.LeaderRating.filter({ leader_id: leaderId }),
    enabled: !!leaderId
  });

  const ratingMutation = useMutation({
    mutationFn: async () => {
      // Check if user already rated
      const existingRating = ratings.find(r => r.user_email === user?.email);
      if (existingRating) {
        throw new Error('You have already rated this leader');
      }

      await base44.entities.LeaderRating.create({
        leader_id: leaderId,
        user_email: user?.email,
        rating: rating[0],
        comment: ratingComment
      });

      // Update leader's aura (average of all ratings)
      const newRatingSum = (leader.rating_sum || 0) + rating[0];
      const newTotalRatings = (leader.total_ratings || 0) + 1;
      const newAura = Math.round(newRatingSum / newTotalRatings);

      await base44.entities.Leader.update(leaderId, {
        rating_sum: newRatingSum,
        total_ratings: newTotalRatings,
        aura_score: Math.max(-100, Math.min(100, newAura))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leader', leaderId]);
      queryClient.invalidateQueries(['leaderRatings', leaderId]);
      setShowRatingForm(false);
      setRating([0]);
      setRatingComment('');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const issueStats = useMemo(() => {
    const resolved = assignedIssues.filter(i => i.status === 'Resolved').length;
    const inProgress = assignedIssues.filter(i => i.status === 'In Progress').length;
    const overdue = assignedIssues.filter(i => 
      i.sla_deadline && isPast(new Date(i.sla_deadline)) && i.status !== 'Resolved'
    ).length;
    
    return { total: assignedIssues.length, resolved, inProgress, overdue };
  }, [assignedIssues]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4729A3]" />
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Leader not found</h2>
          <Link to={createPageUrl('Leaderboard')}>
            <Button className="mt-4">View Leaderboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasUserRated = ratings.some(r => r.user_email === user?.email);

  return (
    <div className="min-h-screen bg-[#EEEBFA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#29136C] via-[#4729A3] to-[#8B70DB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to={createPageUrl('Leaderboard')} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            {leader.profile_photo ? (
              <img 
                src={leader.profile_photo} 
                alt={leader.name}
                className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-white/10 flex items-center justify-center text-5xl font-bold">
                {leader.name?.charAt(0)}
              </div>
            )}

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">{leader.name}</h1>
              <p className="text-white/70 text-lg mb-2">{leader.title}</p>
              <p className="flex items-center justify-center md:justify-start gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                {leader.ward}
              </p>
            </div>

            <AuraScore score={leader.aura_score} size="lg" showLabel />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="text-2xl font-bold">{issueStats.resolved}</p>
              <p className="text-sm text-white/60">Resolved</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold">{issueStats.inProgress}</p>
              <p className="text-sm text-white/60">In Progress</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold">{leader.sla_compliance_rate || 0}%</p>
              <p className="text-sm text-white/60">SLA Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{leader.total_ratings || 0}</p>
              <p className="text-sm text-white/60">Ratings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#29136C]">Rate This Leader</h2>
            {!showRatingForm && user && !hasUserRated && (
              <Button 
                onClick={() => setShowRatingForm(true)}
                className="bg-[#4729A3] hover:bg-[#29136C]"
              >
                <Star className="w-4 h-4 mr-2" />
                Rate Now
              </Button>
            )}
          </div>

          {!user ? (
            <p className="text-gray-500">Please log in to rate this leader.</p>
          ) : hasUserRated ? (
            <p className="text-emerald-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              You have already rated this leader.
            </p>
          ) : showRatingForm ? (
            <div className="space-y-4 bg-gradient-to-br from-[#4729A3]/5 to-[#8B70DB]/5 p-6 rounded-xl border-2 border-[#4729A3]/20">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Aura Rating: <span className={cn(
                    "font-bold text-lg",
                    rating[0] > 0 ? "text-emerald-600" : rating[0] < 0 ? "text-red-600" : "text-gray-500"
                  )}>
                    {rating[0] > 0 ? '+' : ''}{rating[0]}
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-red-500 font-bold text-lg">-100</span>
                    <p className="text-xs text-gray-500">Poor</p>
                  </div>
                  <Slider
                    value={rating}
                    onValueChange={setRating}
                    min={-100}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <div className="text-center">
                    <span className="text-emerald-500 font-bold text-lg">+100</span>
                    <p className="text-xs text-gray-500">Excellent</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Aura reflects aggregated citizen feedback and service performance
                </p>
              </div>
              
              <Textarea
                placeholder="Optional comment about their performance..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowRatingForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => ratingMutation.mutate()}
                  disabled={ratingMutation.isPending}
                  className="bg-[#4729A3] hover:bg-[#29136C]"
                >
                  {ratingMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Rating
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Rate this leader based on their civic performance.</p>
          )}
        </motion.div>

        {/* Assigned Issues */}
        <div>
          <h2 className="text-xl font-bold text-[#29136C] mb-4">
            Assigned Issues ({issueStats.total})
          </h2>

          {assignedIssues.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-500">No issues assigned to this leader yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {assignedIssues.map((issue, index) => (
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
        </div>

        {/* Recent Ratings */}
        {ratings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#29136C] mb-4">Recent Ratings</h2>
            <div className="space-y-3">
              {ratings.slice(0, 5).map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                    r.rating > 0 
                      ? "bg-emerald-100 text-emerald-700" 
                      : r.rating < 0 
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  )}>
                    {r.rating > 0 ? '+' : ''}{r.rating}
                  </div>
                  <div className="flex-1">
                    {r.comment && <p className="text-gray-700">{r.comment}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(r.created_date), 'PPP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}