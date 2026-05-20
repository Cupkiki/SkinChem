import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Crown, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProgressionPanel({ progressionState, isPremium, weeklyScores }) {
  if (!progressionState) return null;

  const toleranceColors = {
    LOW: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
    MEDIUM: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-600' },
    HIGH: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' }
  };

  const colors = toleranceColors[progressionState.tolerance_level] || toleranceColors.MEDIUM;

  const recentScores = weeklyScores?.slice(-4) || [];
  const avgIrritation = recentScores.length > 0 
    ? Math.round(recentScores.reduce((sum, s) => sum + s.irritation_score, 0) / recentScores.length)
    : 0;
  const avgBarrier = recentScores.length > 0
    ? Math.round(recentScores.reduce((sum, s) => sum + s.barrier_stress, 0) / recentScores.length)
    : 0;

  const canEscalate = progressionState.weeks_at_current_level >= 2 && avgIrritation < 40 && avgBarrier < 40;
  const isPaused = progressionState.paused_until && new Date(progressionState.paused_until) > new Date();

  if (!isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 relative overflow-hidden"
      >
        <div className="absolute top-4 right-4">
          <Crown className="w-8 h-8 text-amber-500 opacity-20" />
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-100">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Adaptive Progression Engine</h3>
            <p className="text-slate-700 mb-4">
              Premium users get intelligent routine evolution that adjusts frequency and strength 
              based on your skin's tolerance over time.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Automatic tolerance tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Progressive active escalation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Goal change detection & adaptation</span>
              </div>
            </div>
            <Link to={createPageUrl('Subscription')}>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-6 rounded-3xl border-2", colors.bg, colors.border)}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-2xl", colors.bg)}>
            <TrendingUp className={cn("w-6 h-6", colors.icon)} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Skin Progression</h3>
            <p className="text-sm text-slate-600">Adaptive tolerance tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Premium</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Tolerance Level</p>
          <p className={cn("text-2xl font-bold", colors.text)}>{progressionState.tolerance_level}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Progression Stage</p>
          <p className="text-2xl font-bold text-slate-900">{progressionState.progression_stage}/5</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Weeks at Level</p>
          <p className="text-2xl font-bold text-slate-900">{progressionState.weeks_at_current_level}</p>
        </div>
      </div>

      {recentScores.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-3">Recent Averages (Last 4 Weeks)</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-sm text-slate-600">Avg Irritation</span>
              <span className={cn("text-lg font-bold", avgIrritation < 40 ? "text-emerald-600" : "text-rose-600")}>
                {avgIrritation}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-sm text-slate-600">Avg Barrier Stress</span>
              <span className={cn("text-lg font-bold", avgBarrier < 40 ? "text-emerald-600" : "text-rose-600")}>
                {avgBarrier}%
              </span>
            </div>
          </div>
        </div>
      )}

      {isPaused ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Progression Paused</p>
              <p className="text-sm text-amber-700">
                Goal change detected. Taking it slow while your routine rebuilds. 
                Progression resumes: {new Date(progressionState.paused_until).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : canEscalate ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 mb-1">Ready to Escalate</p>
              <p className="text-sm text-emerald-700">
                Your skin is tolerating actives well. Next routine generation will increase frequency 
                or introduce stronger variants.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Building Tolerance</p>
              <p className="text-sm text-blue-700">
                Maintain current routine for {2 - progressionState.weeks_at_current_level} more week(s) 
                before escalation.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}