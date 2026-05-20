import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Shield, Copy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ScoreBreakdown({ breakdown, onClose }) {
  if (!breakdown) return null;

  const getRiskColor = (score) => {
    if (score < 30) return 'text-emerald-600';
    if (score < 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Score Breakdown</h2>
            <p className="text-sm text-slate-600">How your scores are calculated</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Irritation Risk Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Irritation Risk Score</h3>
                <p className="text-sm text-slate-600">How likely is this routine to cause irritation right now?</p>
              </div>
              <span className={cn("text-3xl font-bold ml-auto", getRiskColor(breakdown.irritation.total))}>
                {breakdown.irritation.total}%
              </span>
            </div>

            <div className="space-y-3 pl-16">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-1">Calculation Method</p>
                <p className="text-xs text-slate-600">
                  Top pair + (0.5 × 2nd pair) + (0.25 × 3rd pair)
                </p>
              </div>

              {breakdown.irritation.topPairs.length > 0 && (
                <div className="space-y-2">
                  {breakdown.irritation.topPairs.map((pair, i) => (
                    <div key={i} className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-rose-900">
                            #{i + 1} Pair: {pair.ingA} × {pair.ingB}
                          </p>
                          <p className="text-xs text-rose-700">
                            Base severity: {pair.baseSeverity}pts
                            {pair.modifiers.sensitivityMod > 1 && ` × ${pair.modifiers.sensitivityMod.toFixed(2)} (sensitivity)`}
                            {pair.modifiers.hasBuffering && ` − 8pts (buffering)`}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {pair.score}pts × {i === 0 ? '1.0' : i === 1 ? '0.5' : '0.25'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {breakdown.irritation.topPairs.length === 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-800">✓ No conflicting ingredient pairs detected</p>
                </div>
              )}

              {(breakdown.irritation.skinType === 'sensitive' || breakdown.irritation.skinConditions.length > 0) && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-900">
                    <span className="font-semibold">Sensitivity Factors:</span>
                    {breakdown.irritation.skinType === 'sensitive' && ' Sensitive skin type'}
                    {breakdown.irritation.skinConditions.length > 0 && (
                      <span className="block text-xs mt-1">
                        Conditions: {breakdown.irritation.skinConditions.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Barrier Stress Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-violet-100">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Barrier Stress Score</h3>
                <p className="text-sm text-slate-600">If I keep doing this for weeks, will my barrier suffer?</p>
              </div>
              <span className={cn("text-3xl font-bold ml-auto", getRiskColor(breakdown.barrier.total))}>
                {breakdown.barrier.total}%
              </span>
            </div>

            <div className="space-y-3 pl-16">
              {breakdown.barrier.activeLoads.length > 0 && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-sm font-semibold text-orange-900 mb-2">
                    Active Load (+{breakdown.barrier.activeLoads.reduce((sum, a) => sum + a.load, 0)}pts total)
                  </p>
                  <div className="space-y-1">
                    {breakdown.barrier.activeLoads.map((active, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white">{active.ing}</Badge>
                          <span className="text-xs text-orange-700">{active.reason}</span>
                        </div>
                        <span className="text-xs font-semibold text-orange-800">+{active.load}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {breakdown.barrier.stackingPenalty > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-900">
                    <span className="font-semibold">Stacking Penalty:</span> 2+ strong actives (+{breakdown.barrier.stackingPenalty}pts)
                  </p>
                  <p className="text-xs text-red-700 mt-1">Consider spacing actives across AM/PM or alternating days</p>
                </div>
              )}

              {breakdown.barrier.barrierSupports.length > 0 && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    Recovery Support (−{breakdown.barrier.barrierSupports.reduce((sum, s) => sum + s.reduction, 0)}pts)
                  </p>
                  <div className="space-y-1">
                    {breakdown.barrier.barrierSupports.map((support, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-white">{support.ing}</Badge>
                        <span className="text-xs font-semibold text-green-800">−{support.reduction}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {breakdown.barrier.activeLoads.length === 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-800">✓ No strong actives detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Redundancy Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-100">
                <Copy className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Redundancy Score</h3>
                <p className="text-sm text-slate-600">Am I overdoing similar things with little extra benefit?</p>
              </div>
              <span className={cn("text-3xl font-bold ml-auto", getRiskColor(breakdown.redundancy.total))}>
                {breakdown.redundancy.total}%
              </span>
            </div>

            <div className="space-y-3 pl-16">
              {breakdown.redundancy.patterns.length > 0 ? (
                <div className="space-y-2">
                  {breakdown.redundancy.patterns.map((pattern, i) => (
                    <div key={i} className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-blue-900">{pattern.pattern}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pattern.ingredients.map((ing, j) => (
                              <Badge key={j} variant="outline" className="bg-white text-xs">{ing}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white">+{pattern.penalty}pts</Badge>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        {pattern.pattern === 'Multiple exfoliants' && 'Consider using different exfoliants on alternate days'}
                        {pattern.pattern === 'Multiple retinoids' && 'Choose one retinoid to avoid overload'}
                        {pattern.pattern === 'Multiple hydrators' && 'One hydrator is usually sufficient'}
                        {pattern.pattern === 'Multiple moisturizers' && 'Combine or choose the one that works best'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-800">✓ No redundant patterns detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 rounded-b-3xl">
          <Button onClick={onClose} className="w-full rounded-xl">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}