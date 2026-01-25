import React, { useMemo } from 'react';
import { AlertCircle, Zap, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const RESOURCE_ESTIMATES = {
  Garbage: 30,
  Water: 60,
  Road: 70,
  Safety: 50,
  Parks: 40,
  Other: 45
};

const SEVERITY_WEIGHTS = {
  Low: 20,
  Medium: 50,
  High: 75,
  Critical: 100
};

export default function ImpactPredictor({ category, severity, ward, latitude }) {
  const impactScore = useMemo(() => {
    if (!category || !severity) return 0;

    // Estimate affected population (0-100 scale)
    // Base estimate: 30 (some people affected)
    // Boost if in populated area (ward/latitude provided): +20
    let affectedScore = 30;
    if (ward || latitude) {
      affectedScore += 20;
    }

    // Severity component (0-100)
    const severityScore = SEVERITY_WEIGHTS[severity] || 50;

    // Resource estimate (0-100)
    const resourceScore = RESOURCE_ESTIMATES[category] || 45;

    // Weighted calculation: 0.5*affected + 0.3*severity + 0.2*resource
    const score = Math.round(
      affectedScore * 0.5 + severityScore * 0.3 + resourceScore * 0.2
    );

    return Math.min(100, Math.max(0, score));
  }, [category, severity, ward, latitude]);

  const getImpactLevel = () => {
    if (impactScore >= 76) return { label: 'Critical Impact', color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-700' };
    if (impactScore >= 51) return { label: 'High Impact', color: 'bg-orange-500', lightBg: 'bg-orange-50', textColor: 'text-orange-700' };
    if (impactScore >= 26) return { label: 'Medium Impact', color: 'bg-yellow-500', lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' };
    return { label: 'Low Impact', color: 'bg-green-500', lightBg: 'bg-green-50', textColor: 'text-green-700' };
  };

  const impactLevel = getImpactLevel();

  return (
    <div className={cn("rounded-xl p-5 border-2 bg-white dark:bg-slate-900", impactLevel.lightBg, `border-${impactLevel.color.split('-')[1]}-400`)}>
      <div className="flex items-start gap-3 mb-4">
        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Impact Predictor</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Estimated reach: how many people this issue will help if resolved
          </p>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-4">
        <div className="flex items-end gap-3 mb-2">
          <div className="text-5xl font-bold text-slate-900 dark:text-white">{impactScore}</div>
          <div className="flex-1">
            <div className={cn("text-sm font-bold mb-1", impactLevel.textColor)}>
              {impactLevel.label}
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
              <div
                className={cn("h-3 rounded-full transition-all shadow-md", impactLevel.color)}
                style={{ width: `${impactScore}%` }}
              />
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
          0 = Low impact | 100 = Critical impact
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>People Affected</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">{Math.round(affectedScore * 0.5)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Severity</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">{severity || '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
            <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Effort Required</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">
            {category && RESOURCE_ESTIMATES[category] ? `${RESOURCE_ESTIMATES[category]}%` : '—'}
          </span>
        </div>
      </div>

      {/* Tips */}
      {impactScore > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
            💡 <strong>Tip:</strong> {
              impactScore >= 76 ? 'This will be high-priority for the community! Your report could help many people.' :
              impactScore >= 51 ? 'This has good visibility potential. Include details to maximize impact.' :
              impactScore >= 26 ? 'Consider adding more context or location details to increase reach.' :
              'Adding your location and severity details will boost visibility.'
            }
          </p>
        </div>
      )}
    </div>
  );
}