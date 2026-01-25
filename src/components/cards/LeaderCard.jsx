import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import AuraScore from '../ui/AuraScore';
import { CheckCircle, Clock, Target, Award, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function LeaderCard({ leader, rank }) {
  const { data: issues = [] } = useQuery({
    queryKey: ['issues', leader.id],
    queryFn: () => base44.entities.Issue.filter({ assigned_leader_id: leader.id })
  });

  const breachCount = React.useMemo(() => {
    return issues.filter(i => i.contract_status === 'Contract Breached').length;
  }, [issues]);

  const getRankStyle = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
    return 'bg-[#4729A3]/10 text-[#4729A3]';
  };

  return (
    <Link
      to={createPageUrl(`LeaderProfile?id=${leader.id}`)}
      className="group block bg-white rounded-2xl p-6 border border-[#4729A3]/10 hover:border-[#4729A3]/30 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0",
          getRankStyle()
        )}>
          {rank <= 3 ? (
            <Award className="w-6 h-6" />
          ) : (
            `#${rank}`
          )}
        </div>

        {/* Profile */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {leader.profile_photo ? (
              <img 
                src={leader.profile_photo} 
                alt={leader.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#4729A3]/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4729A3] to-[#8B70DB] flex items-center justify-center text-white text-xl font-bold">
                {leader.name?.charAt(0) || 'L'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-[#29136C] group-hover:text-[#4729A3] transition-colors">
                {leader.name}
              </h3>
              <p className="text-sm text-gray-500">{leader.title}</p>
              <p className="text-xs text-[#4729A3]">{leader.ward}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-bold text-sm">{leader.issues_resolved || 0}</span>
              </div>
              <span className="text-xs text-gray-500">Resolved</span>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-sm">{leader.issues_assigned || 0}</span>
              </div>
              <span className="text-xs text-gray-500">Assigned</span>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-purple-600">
                <Target className="w-4 h-4" />
                <span className="font-bold text-sm">{leader.sla_compliance_rate || 0}%</span>
              </div>
              <span className="text-xs text-gray-500">SLA</span>
            </div>
            {breachCount > 0 && (
              <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold text-sm">{breachCount}</span>
                </div>
                <span className="text-xs text-red-600">Breached</span>
              </div>
            )}
          </div>
        </div>

        {/* Aura Score */}
        <div className="flex-shrink-0">
          <AuraScore score={leader.aura_score} size="lg" showLabel={false} />
        </div>
      </div>
    </Link>
  );
}