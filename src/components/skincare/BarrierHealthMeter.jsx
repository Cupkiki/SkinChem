import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BarrierHealthMeter({ selectedIngredients, ingredients }) {
  // Calculate barrier health based on selected ingredients
  const calculateBarrierImpact = () => {
    let score = 70; // Base score
    let strengthening = 0;
    let compromising = 0;
    
    selectedIngredients.forEach(ingId => {
      const ingredient = ingredients.find(i => i.id === ingId);
      if (!ingredient) return;
      
      // Barrier support families
      if (['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(ingredient.family)) {
        strengthening++;
        score += 5;
      }
      
      // Active families that may stress barrier
      if (['RETINOID', 'AHA', 'BHA', 'BPO', 'VITC_LAA'].includes(ingredient.family)) {
        compromising++;
        score -= 8;
      }
      
      // High potency reduces score
      if (ingredient.potency >= 3) {
        score -= 5;
      } else if (ingredient.potency >= 2) {
        score -= 2;
      }
      
      // High irritation base reduces score
      if (ingredient.irritation_base > 50) {
        score -= 5;
      } else if (ingredient.irritation_base > 25) {
        score -= 2;
      }
    });
    
    // Bonus for having barrier-supporting ingredients
    const hasBarrier = ingredients.some(i => selectedIngredients.includes(i.id) && i.family === 'BARRIER');
    const hasNiacinamide = ingredients.some(i => selectedIngredients.includes(i.id) && i.family === 'NIACINAMIDE');
    if (hasBarrier || hasNiacinamide) {
      score += 10;
    }
    
    // Penalty for too many actives without support
    if (compromising > 2 && strengthening < 1) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const score = calculateBarrierImpact();
  
  const getHealthStatus = () => {
    if (score >= 80) return { label: 'Excellent', color: 'emerald', icon: CheckCircle2 };
    if (score >= 60) return { label: 'Good', color: 'green', icon: Shield };
    if (score >= 40) return { label: 'Moderate', color: 'amber', icon: AlertTriangle };
    return { label: 'At Risk', color: 'rose', icon: AlertTriangle };
  };

  const status = getHealthStatus();
  const StatusIcon = status.icon;

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      light: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      light: 'bg-green-50',
      border: 'border-green-200'
    },
    amber: {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      light: 'bg-amber-50',
      border: 'border-amber-200'
    },
    rose: {
      bg: 'bg-rose-500',
      text: 'text-rose-600',
      light: 'bg-rose-50',
      border: 'border-rose-200'
    }
  };

  const colors = colorClasses[status.color];

  // Find barrier-supporting vs barrier-stressing ingredients
  const strengthening = ingredients.filter(i => 
    selectedIngredients.includes(i.id) && ['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(i.family)
  );
  const compromising = ingredients.filter(i => 
    selectedIngredients.includes(i.id) && ['RETINOID', 'AHA', 'BHA', 'BPO', 'VITC_LAA'].includes(i.family)
  );

  return (
    <div className={cn("rounded-3xl border-2 p-6", colors.light, colors.border)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-2xl", colors.light)}>
            <Shield className={cn("w-6 h-6", colors.text)} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Skin Barrier Health</h3>
            <p className="text-sm text-slate-500">Based on your routine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("w-5 h-5", colors.text)} />
          <span className={cn("font-bold text-lg", colors.text)}>{status.label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-white rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("absolute inset-y-0 left-0 rounded-full", colors.bg)}
        />
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <span className="text-xs font-bold text-slate-700">{score}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/70">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">Strengthening</span>
          </div>
          <div className="space-y-1">
            {strengthening.length > 0 ? (
              strengthening.map(ing => (
                <p key={ing.id} className="text-sm text-emerald-700">{ing.name}</p>
              ))
            ) : (
              <p className="text-sm text-slate-400">None selected</p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span className="text-sm font-medium text-slate-700">Potentially Stressing</span>
          </div>
          <div className="space-y-1">
            {compromising.length > 0 ? (
              compromising.map(ing => (
                <p key={ing.id} className="text-sm text-rose-700">{ing.name}</p>
              ))
            ) : (
              <p className="text-sm text-slate-400">None selected</p>
            )}
          </div>
        </div>
      </div>

      {score < 60 && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Recommendation:</strong> Consider adding barrier-supporting ingredients like Ceramides, Niacinamide, or Centella to balance your actives.
          </p>
        </div>
      )}
    </div>
  );
}