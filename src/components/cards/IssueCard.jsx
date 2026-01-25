import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { StatusBadge, SeverityBadge, CategoryBadge } from '../ui/StatusBadge';
import { MapPin, Clock, Users, Repeat2, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function IssueCard({ issue, compact = false, leaders = [] }) {
  const [imageError, setImageError] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const queryClient = useQueryClient();
  const isOverdue = issue.sla_deadline && isPast(new Date(issue.sla_deadline)) && issue.status !== 'Resolved';
  const timeAgo = formatDistanceToNow(new Date(issue.created_date), { addSuffix: true });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: reposts = [] } = useQuery({
    queryKey: ['reposts', issue.id],
    queryFn: () => base44.entities.Repost.filter({ issue_id: issue.id }),
    enabled: !!issue.id
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      const userReposts = reposts.filter(r => r.user_email === user?.email);
      const recentRepost = userReposts.find(r => 
        differenceInHours(new Date(), new Date(r.created_date)) < 24
      );
      
      if (recentRepost) {
        throw new Error('You can only repost once every 24 hours');
      }

      await base44.entities.Repost.create({
        issue_id: issue.id,
        user_email: user?.email
      });

      await base44.entities.Issue.update(issue.id, {
        repost_count: (issue.repost_count || 0) + 1,
        civic_pulse_score: (issue.civic_pulse_score || 0) + 10
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      queryClient.invalidateQueries(['issue', issue.id]);
      queryClient.invalidateQueries(['reposts', issue.id]);
      toast.success('Issue reposted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleRepost = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to repost');
      return;
    }
    repostMutation.mutate();
  };

  const hasReposted = user && reposts.some(r => r.user_email === user?.email);

  // Get tagged leaders
  const taggedLeaders = React.useMemo(() => {
    if (!issue.tagged_leader_ids || !leaders.length) return [];
    return leaders.filter(l => issue.tagged_leader_ids.includes(l.id));
  }, [issue.tagged_leader_ids, leaders]);

  if (compact) {
    return (
      <Link 
        to={createPageUrl(`IssueDetail?id=${issue.id}`)}
        className="block bg-white rounded-xl p-4 border border-emerald-200/50 hover:border-emerald-400 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start gap-3">
          {issue.photo && !imageError ? (
            <img 
              src={issue.photo} 
              alt={issue.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-emerald-100 flex items-center justify-center text-3xl flex-shrink-0">
              {issue.category === 'Garbage' ? '🗑️' : issue.category === 'Water' ? '💧' : issue.category === 'Road' ? '🛣️' : issue.category === 'Safety' ? '⚠️' : issue.category === 'Parks' ? '🌳' : '📋'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-emerald-950 truncate">{issue.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <CategoryBadge category={issue.category} size="sm" />
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
          </div>
          <SeverityBadge severity={issue.severity} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl(`IssueDetail?id=${issue.id}`)}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl",
        isOverdue 
          ? "border-red-300 shadow-red-100" 
          : "border-emerald-200/50 hover:border-emerald-400"
      )}
    >
      {/* Image */}
      {issue.photo && !imageError ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={issue.photo} 
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <CategoryBadge category={issue.category} />
            <SeverityBadge severity={issue.severity} />
          </div>
          {isOverdue && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              SLA Overdue
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
          <div className="text-7xl">
            {issue.category === 'Garbage' ? '🗑️' : issue.category === 'Water' ? '💧' : issue.category === 'Road' ? '🛣️' : issue.category === 'Safety' ? '⚠️' : issue.category === 'Parks' ? '🌳' : '📋'}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <CategoryBadge category={issue.category} />
            <SeverityBadge severity={issue.severity} />
          </div>
          {isOverdue && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              SLA Overdue
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {!issue.photo && (
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge category={issue.category} />
            <SeverityBadge severity={issue.severity} />
            {isOverdue && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
        )}

        <h3 className="text-lg font-bold text-emerald-950 mb-2 group-hover:text-emerald-700 transition-colors">
          {issue.title}
        </h3>

        {issue.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <StatusBadge status={issue.status} size="sm" />
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {issue.vouch_count || 0}
            </span>
            {issue.status !== 'Resolved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                disabled={repostMutation.isPending}
                className={cn(
                  "h-7 px-2 gap-1",
                  hasReposted 
                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                    : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                )}
                >
                {repostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Repeat2 className="w-4 h-4" />
                )}
                <span className="text-sm">{issue.repost_count || 0}</span>
              </Button>
            )}
            {issue.status === 'Resolved' && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Repeat2 className="w-4 h-4" />
                {issue.repost_count || 0}
              </span>
            )}
          </div>
        </div>

        {/* Tagged Leaders */}
        {taggedLeaders.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-500">Tagged:</span>
            {taggedLeaders.slice(0, 2).map(leader => (
              <span 
                key={leader.id}
                className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium"
              >
                {leader.name}
              </span>
            ))}
            {taggedLeaders.length > 2 && (
              <span className="text-xs text-gray-400">+{taggedLeaders.length - 2} more</span>
            )}
          </div>
        )}

        {issue.address && (
          <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span className="truncate">{issue.address}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {issue.is_anonymous ? 'Anonymous' : issue.reporter_name || 'Community Member'}
          </span>
          <div className="flex items-center gap-2">
            {issue.status !== 'Resolved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                disabled={repostMutation.isPending}
                className={cn(
                  "h-6 px-2 gap-1 text-xs",
                  hasReposted 
                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                    : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50"
                )}
                >
                {repostMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Repeat2 className="w-3 h-3" />
                )}
                {issue.repost_count || 0}
              </Button>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}