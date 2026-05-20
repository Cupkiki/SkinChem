import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Shield, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ScoreBreakdownModal({ type, breakdown, score, onClose }) {
  if (!breakdown) return null;

  const configs = {
    irritation: {
      icon: AlertTriangle,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      title: 'Irritation Risk Score',
      subtitle: 'How likely is this routine to cause irritation right now?'
    },
    barrier: {
      icon: Shield,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      title: 'Barrier Stress Score',
      subtitle: 'If I keep doing this for weeks, will my barrier suffer?'
    },
    redundancy: {
      icon: Copy,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      title: 'Redundancy Score',
      subtitle: 'Am I overdoing similar things with little extra benefit?'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  const getRiskColor = (score) => {
    if (score < 40) return 'text-emerald-600';
    if (score < 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-2xl", config.iconBg)}>
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
              <p className="text-sm text-slate-600">{config.subtitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center p-6 rounded-2xl bg-slate-50">
            <p className="text-sm text-slate-600 mb-2">Final Score</p>
            <span className={cn("text-5xl font-bold", getRiskColor(score))}>
              {score}%
            </span>
          </div>

          {/* Irritation Risk Breakdown */}
          {type === 'irritation' && (
            <>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-1">Calculation Method</p>
                <p className="text-xs text-slate-600">
                  Top pair + (0.5 × 2nd pair) + (0.25 × 3rd pair)
                </p>
              </div>

              {breakdown.topPairs.length > 0 ? (
                <div className="space-y-2">
                  {breakdown.topPairs.map((pair, i) => (
                    <div key={i} className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-rose-900">
                            #{i + 1} Pair: {pair.ingA} × {pair.ingB}
                          </p>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs text-rose-700">
                              Base severity: {pair.baseSeverity}pts
                            </p>
                            {pair.mechanism && (
                              <p className="text-xs text-rose-600">
                                Mechanism: {pair.mechanism.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            )}
                            {pair.modifiers.timingSeparation < 1 && (
                              <p className="text-xs text-green-700">
                                ✓ Timing separation: × {pair.modifiers.timingSeparation} (reduced 60%)
                              </p>
                            )}
                            {pair.modifiers.sensitivityMod > 1 && (
                              <p className="text-xs text-rose-700">
                                Sensitivity: × {pair.modifiers.sensitivityMod.toFixed(2)}
                              </p>
                            )}
                            {pair.modifiers.hasBuffering && (
                              <p className="text-xs text-green-700">
                                ✓ Buffering: − 8pts
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {pair.score}pts × {i === 0 ? '1.0' : i === 1 ? '0.5' : '0.25'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-800">✓ No conflicting ingredient pairs detected</p>
                </div>
              )}

              {(breakdown.skinType === 'sensitive' || breakdown.skinConditions.length > 0) && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-900">
                    <span className="font-semibold">Sensitivity Factors:</span>
                    {breakdown.skinType === 'sensitive' && ' Sensitive skin type'}
                    {breakdown.skinConditions.length > 0 && (
                      <span className="block text-xs mt-1">
                        Conditions: {breakdown.skinConditions.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Barrier Stress Breakdown */}
          {type === 'barrier' && (
            <>
              {breakdown.activeLoads.length > 0 && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-sm font-semibold text-orange-900 mb-2">
                    Active Load (+{breakdown.activeLoads.reduce((sum, a) => sum + a.load, 0)}pts total)
                  </p>
                  <div className="space-y-1">
                    {breakdown.activeLoads.map((active, i) => (
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

              {breakdown.stackingPenalty > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-900">
                    <span className="font-semibold">Stacking Penalty:</span> 2+ strong actives (+{breakdown.stackingPenalty}pts)
                  </p>
                  <p className="text-xs text-red-700 mt-1">Consider spacing actives across AM/PM or alternating days</p>
                </div>
              )}

              {breakdown.barrierSupports.length > 0 && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    Recovery Support (−{breakdown.barrierSupports.reduce((sum, s) => sum + s.reduction, 0)}pts, max 20pts)
                  </p>
                  <div className="space-y-1">
                    {breakdown.barrierSupports.map((support, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-white">{support.ing}</Badge>
                        <span className="text-xs font-semibold text-green-800">−{support.reduction}pts</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 mt-2">Recovery subtraction is capped per routine</p>
                </div>
              )}

              {breakdown.activeLoads.length === 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-800">✓ No strong actives detected</p>
                </div>
              )}
            </>
          )}

          {/* Redundancy Breakdown */}
          {type === 'redundancy' && (
            <>
              {breakdown.patterns.length > 0 ? (
                <div className="space-y-2">
                  {breakdown.patterns.map((pattern, i) => (
                    <div key={i} className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
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
            </>
          )}
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