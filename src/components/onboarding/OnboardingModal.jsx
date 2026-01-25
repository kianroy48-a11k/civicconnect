import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Users, 
  Target,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Camera,
  AlertTriangle,
  CheckCircle,
  Repeat2,
  ThumbsUp,
  Star,
  Map,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const tutorialPages = [
  {
    title: "Welcome to Civic Audit",
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-lg text-gray-700 leading-relaxed">
          A platform that transforms civic complaints into tracked, time-bound accountability.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="font-semibold text-blue-900 mb-2">The Core Problem</p>
          <p className="text-gray-600">
            Citizens report issues that often go unresolved with no transparency, no deadlines, and no accountability.
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="font-semibold text-blue-700 mb-2">Our Solution</p>
          <p className="text-gray-700">
            <strong>From Complaint → Closure</strong> with public visibility, SLA tracking, leader ratings, and community verification.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "How Reporting Works",
    icon: Camera,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Report any civic issue in 4 simple steps:
        </p>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-semibold text-gray-800">Select Category</p>
              <p className="text-sm text-gray-600">Garbage, Water, Road, Safety, Parks, or Other</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-semibold text-gray-800">Add Location & Photo</p>
              <p className="text-sm text-gray-600">GPS auto-detects, or manually select. Photo evidence strongly recommended.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-semibold text-gray-800">Specify Details</p>
              <p className="text-sm text-gray-600">Title, description, tags, and severity level</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
            <div>
              <p className="font-semibold text-gray-800">Submit (Anonymously or Publicly)</p>
              <p className="text-sm text-gray-600">Your identity is protected if you choose anonymous mode</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Key Terms & Concepts",
    icon: Target,
    content: (
      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="font-semibold text-blue-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            SLA (Service Level Agreement)
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Time-bound responsibility. Every issue has a 48-hour deadline for resolution. Overdue issues are flagged publicly.
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="font-semibold text-purple-900 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Aura Score
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Aggregated citizen trust score (-100 to +100) reflecting leader responsiveness and performance. Updated by community ratings.
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="font-semibold text-orange-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Civic Pulse
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Trending issues feed based on urgency, engagement, and time sensitivity.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="font-semibold text-blue-900 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            Verification / Vouch
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Community confirms an issue exists. 3+ vouches = Verified status.
          </p>
        </div>

        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="font-semibold text-amber-900 flex items-center gap-2">
            <Repeat2 className="w-4 h-4" />
            Repost
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Amplify unresolved issues to keep them visible. Limited to once per 24 hours per user.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Tracking & Accountability",
    icon: AlertTriangle,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Every issue is tracked from report to resolution with full transparency:
        </p>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="font-semibold text-green-900">On Track</p>
          </div>
          <p className="text-sm text-gray-700">Issue reported, 24+ hours remaining until SLA deadline</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <p className="font-semibold text-orange-900">Urgent</p>
          </div>
          <p className="text-sm text-gray-700">Less than 12 hours until SLA deadline</p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <p className="font-semibold text-red-900">OVERDUE</p>
          </div>
          <p className="text-sm text-gray-700">SLA deadline passed. Publicly flagged for accountability.</p>
        </div>

        <p className="text-sm text-gray-500 italic mt-4">
          Overdue issues impact leader performance ratings and appear in the "High-Priority Neglect" section.
        </p>
      </div>
    )
  },
  {
    title: "Maps & Heatmaps",
    icon: Map,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Visual accountability through geographic data:
        </p>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Issue Pins
          </p>
          <p className="text-sm text-gray-600">
            Every issue appears as a colored marker. Click any pin to see details, status, and SLA countdown.
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Critical</span>
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">High</span>
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">Medium</span>
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Low</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            Heatmap View
          </p>
          <p className="text-sm text-gray-600">
            Shows concentrated problem areas. Red zones = high neglect. Helps prioritize systemic failures over isolated incidents.
          </p>
        </div>

        <p className="text-xs text-gray-500 italic">
          💡 Filter by category, status, or severity to focus on specific problems.
        </p>
      </div>
    )
  },
  {
    title: "Aura & Leader Ratings",
    icon: Star,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Leaders are rated by citizens based on responsiveness and effectiveness:
        </p>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="font-semibold text-green-900 mb-2">+100 to +50: Excellent</p>
          <p className="text-sm text-gray-700">Highly responsive, resolves issues on time</p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
          <p className="font-semibold text-amber-900 mb-2">+49 to -30: Average</p>
          <p className="text-sm text-gray-700">Moderate responsiveness, mixed performance</p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
          <p className="font-semibold text-red-900 mb-2">-31 to -100: Poor</p>
          <p className="text-sm text-gray-700">Unresponsive, frequent SLA violations</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="font-semibold text-gray-800 mb-2">How It Works</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Ratings are <strong>anonymous</strong></li>
            <li>Calculated as <strong>average</strong> of all citizen ratings</li>
            <li>Updates in real-time as new ratings come in</li>
            <li>Visible on leader profiles and leaderboard</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Community Participation",
    icon: Users,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Your participation strengthens accountability:
        </p>

        <div className="space-y-3">
          <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-200">
            <ThumbsUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Verify Issues</p>
              <p className="text-sm text-gray-600">
                Confirm an issue exists or has been resolved. 3+ verifications = Verified status.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-200">
            <Repeat2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Repost Unresolved Issues</p>
              <p className="text-sm text-gray-600">
                Keep important issues visible. Boosts Civic Pulse score. Limit: once per 24 hours.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-200">
            <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Rate Leaders</p>
              <p className="text-sm text-gray-600">
                Anonymously rate officials from -100 to +100 based on their performance.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-200">
            <Camera className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Optional Memes</p>
              <p className="text-sm text-gray-600">
                Express frustration creatively. Memes make issues more shareable.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Safety & Moderation",
    icon: Shield,
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Anonymous Protection
          </p>
          <p className="text-sm text-gray-700">
            Your identity is fully protected when reporting anonymously. Only admins can see reporter emails for moderation.
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anti-Harassment Rules
          </p>
          <p className="text-sm text-gray-700">
            Offensive language, personal attacks, and misinformation are not tolerated. Reports are flagged for review.
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="font-semibold text-blue-900 mb-2">Emergency Situations</p>
          <p className="text-sm text-gray-700">
            For life-threatening emergencies, always call local authorities first (Police: 100, Ambulance: 108, Fire: 101).
          </p>
        </div>

        <p className="text-xs text-gray-500 italic">
          This platform is for civic accountability, not emergency response.
        </p>
      </div>
    )
  },
  {
    title: "Why This Matters",
    icon: TrendingUp,
    content: (
      <div className="space-y-4">
        <p className="text-lg font-semibold text-emerald-950">
          Public visibility creates accountability
        </p>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Transparency</p>
              <p className="text-sm text-gray-600">
                Every issue, every deadline, and every leader rating is publicly visible.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Collective Action</p>
              <p className="text-sm text-gray-600">
                When many citizens verify the same issue, it gains priority and forces action.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Data-Driven Governance</p>
              <p className="text-sm text-gray-600">
                Heatmaps and trends reveal systemic failures, not just isolated incidents.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-4">
          <p className="text-sm text-gray-700 italic">
            "When citizens have data, leaders are accountable. When leaders are accountable, governance improves."
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Get Started",
    icon: Zap,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-gray-700">
          Ready to make your voice heard?
        </p>

        <div className="grid gap-4">
          <Link to={createPageUrl('ReportIssue')}>
            <Button className="w-full h-auto py-4 bg-blue-600 hover:bg-blue-700 justify-start">
              <div className="flex items-center gap-4">
                <Camera className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold text-base">Report an Issue</p>
                  <p className="text-xs text-white/70">Start the reporting wizard</p>
                </div>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl('IssueMap')}>
            <Button variant="outline" className="w-full h-auto py-4 justify-start border-blue-300 hover:bg-blue-50">
              <div className="flex items-center gap-4">
                <Map className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-base text-slate-900">Explore the Map</p>
                  <p className="text-xs text-gray-500">See all reported issues</p>
                </div>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl('Leaderboard')}>
            <Button variant="outline" className="w-full h-auto py-4 justify-start border-blue-300 hover:bg-blue-50">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-base text-slate-900">View Leaderboard</p>
                  <p className="text-xs text-gray-500">See leader performance</p>
                </div>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl('CivicPulse')}>
            <Button variant="outline" className="w-full h-auto py-4 justify-start border-blue-300 hover:bg-blue-50">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-base text-slate-900">Browse Civic Pulse</p>
                  <p className="text-xs text-gray-500">Trending issues feed</p>
                </div>
              </div>
            </Button>
          </Link>
        </div>

        <p className="text-sm text-center text-gray-500 mt-6">
          You can always access this guide from the Help button in the header.
        </p>
      </div>
    )
  }
];

export default function OnboardingModal({ isOpen, onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const progress = ((currentPage + 1) / tutorialPages.length) * 100;
  const CurrentIcon = tutorialPages[currentPage].icon;

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('civic_audit_onboarding_completed', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col shadow-2xl border-2 border-blue-200">
        <DialogTitle className="sr-only">{tutorialPages[currentPage].title}</DialogTitle>
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{tutorialPages[currentPage].title}</h2>
                  <p className="text-sm text-white/70">Step {currentPage + 1} of {tutorialPages.length}</p>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/20" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tutorialPages[currentPage].content}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleComplete}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip & Explore
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentPage === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {currentPage === tutorialPages.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}