import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Copy, TrendingUp, Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ScoreBreakdownModal from './ScoreBreakdownModal';

export default function RiskScorePanel({ selectedIngredients, ingredients, familyRules = [], compatibilityRules = [], skinType, skinConditions = [], sensitivityLevel = 1, timeOfDay = null }) {
  const [activeBreakdown, setActiveBreakdown] = useState(null);

  const riskAnalysis = useMemo(() => {
    if (selectedIngredients.length === 0) return null;

    const selectedIngData = selectedIngredients
      .map(ingId => ingredients.find(i => i.id === ingId))
      .filter(Boolean);

    // SKIN TYPE & CONDITION MULTIPLIERS (multiplicative tolerance adjustments)
    // Irritation multipliers
    const irritationMultipliers = {
      skinType: {
        normal: 1.0,
        dry: 1.05,
        oily: 0.95,
        combination: 1.0,
        sensitive: 1.15
      },
      conditions: {
        acne_prone: 1.0,
        rosacea: 1.25,
        barrier_damaged: 1.25,
        dehydrated: 1.1,
        sun_damaged: 1.05,
        aging: 1.0
      }
    };

    // Barrier multipliers
    const barrierMultipliers = {
      skinType: {
        normal: 1.0,
        dry: 1.2,
        oily: 0.9,
        combination: 1.0,
        sensitive: 1.2
      },
      conditions: {
        acne_prone: 1.0,
        rosacea: 1.3,
        barrier_damaged: 1.4,
        dehydrated: 1.2,
        sun_damaged: 1.1,
        aging: 1.0
      }
    };

    // Calculate total multipliers
    let irritationMod = irritationMultipliers.skinType[skinType] || 1.0;
    let barrierMod = barrierMultipliers.skinType[skinType] || 1.0;
    let confidenceDowngrade = false;

    skinConditions.forEach(condition => {
      irritationMod *= (irritationMultipliers.conditions[condition] || 1.0);
      barrierMod *= (barrierMultipliers.conditions[condition] || 1.0);
      
      // Flag confidence downgrade for high-risk conditions
      if (['rosacea', 'barrier_damaged'].includes(condition)) {
        confidenceDowngrade = true;
      }
    });

    // Additional sensitivity level multiplier (from user profile)
    if (sensitivityLevel >= 4) {
      irritationMod *= 1.25;
      barrierMod *= 1.15;
    } else if (sensitivityLevel >= 3) {
      irritationMod *= 1.15;
      barrierMod *= 1.1;
    }

    // CAP multipliers to prevent score inflation
    irritationMod = Math.min(irritationMod, 1.6);
    barrierMod = Math.min(barrierMod, 1.8);

    // 1. IRRITATION RISK SCORE (0-100) - PAIR-LEVEL ANALYSIS
    // "How likely is this routine to cause irritation right now?"
    
    // Generate all pairs
    const pairRisks = [];
    for (let i = 0; i < selectedIngData.length; i++) {
      for (let j = i + 1; j < selectedIngData.length; j++) {
        const ingA = selectedIngData[i];
        const ingB = selectedIngData[j];
        
        // STEP 3: Find the rule for this pair (priority order)
        // 3A: Look for ingredient-specific exception rule (highest priority)
        let rule = compatibilityRules.find(r =>
          (r.ingredient_a_id === ingA.id && r.ingredient_b_id === ingB.id) ||
          (r.ingredient_a_id === ingB.id && r.ingredient_b_id === ingA.id)
        );
        
        // 3B: If no exception, use Family rule
        if (!rule) {
          const [famA, famB] = [ingA.family, ingB.family].sort();
          rule = familyRules.find(r =>
            r.family_a === famA && r.family_b === famB
          );
        }
        
        // Only process if rule exists and is problematic
        if (rule && ['CONFLICT', 'CONDITIONAL'].includes(rule.relationship)) {
          // Base severity from rule (0-100)
          let baseSeverity = rule.severity || 50;
          let pairScore = baseSeverity;
          const mechanism = rule.mechanism;
          
          // STEP 4A: Apply irritation multiplier (calculated above, already capped)
          pairScore *= irritationMod;
          
          // STEP 4B: Timing separation modifier
          const shouldSeparate = rule.recommended_action?.toLowerCase().includes('separate') || 
                                rule.recommended_action?.toLowerCase().includes('am/pm') ||
                                rule.condition_payload?.time_separation_hours > 0;
          const isSeparated = timeOfDay !== null;
          
          if (shouldSeparate && isSeparated) {
            pairScore *= 0.4; // 60% reduction if properly separated
          }
          
          // STEP 4C: Buffering modifier (ONLY for IRRITATION and BARRIER_STRESS)
          let bufferingApplied = false;
          if (['IRRITATION', 'BARRIER_STRESS'].includes(mechanism)) {
            const hasBarrierSupport = selectedIngData.some(ing => 
              ['BARRIER', 'HYDRATOR'].includes(ing.family)
            );
            if (hasBarrierSupport) {
              pairScore = Math.max(0, pairScore - 8);
              bufferingApplied = true;
            }
          }
          
          // STEP 4D: Irritant add-ons (fragrance/alcohol + strong actives)
          const hasIrritant = selectedIngData.some(ing => 
            ['FRAGRANCE_EO', 'ALCOHOL_DENAT'].includes(ing.family)
          );
          const hasStrongActive = ingA.potency >= 2 || ingB.potency >= 2;
          if (hasIrritant && hasStrongActive) {
            pairScore += 10;
          }
          
          // Cap at 100
          pairScore = Math.min(100, pairScore);
          
          pairRisks.push({
            ingA: ingA.name,
            ingB: ingB.name,
            score: Math.round(pairScore),
            baseSeverity,
            mechanism,
            modifiers: { 
              irritationMod, 
              hasBuffering: bufferingApplied,
              timingSeparation: shouldSeparate && isSeparated ? 0.4 : 1,
              hasIrritant
            }
          });
        }
      }
    }
    
    // STEP 5: Compute Irritation Risk Score (dominant pair model)
    // Sort by score and keep top 3
    pairRisks.sort((a, b) => b.score - a.score);
    const top3Pairs = pairRisks.slice(0, 3);
    
    // Weighted sum: Top1 + 0.5×Top2 + 0.25×Top3
    let irritationScore = 0;
    if (top3Pairs[0]) irritationScore += top3Pairs[0].score;
    if (top3Pairs[1]) irritationScore += top3Pairs[1].score * 0.5;
    if (top3Pairs[2]) irritationScore += top3Pairs[2].score * 0.25;
    
    irritationScore = Math.min(100, Math.round(irritationScore));

    // STEP 6: Barrier Stress Score (load-driven budget system)
    // "If I keep doing this for weeks, will my barrier suffer?"
    let barrierStress = 0;
    const activeLoads = [];
    
    // 6A: Add points for actives based on family
    selectedIngData.forEach(ing => {
      let load = 0;
      let reason = '';
      
      if (ing.family === 'RETINOID') { 
        load = 25; 
        reason = 'Strong retinoid';
      } else if (ing.family === 'AHA') { 
        load = 20; 
        reason = 'AHA exfoliant';
      } else if (ing.family === 'BHA') { 
        load = 15; 
        reason = 'BHA exfoliant';
      } else if (ing.family === 'BPO') { 
        load = 20; 
        reason = 'Benzoyl peroxide';
      } else if (ing.family === 'VITC_LAA') { 
        load = 10; 
        reason = 'Vitamin C (L-AA)';
      }
      
      if (load > 0) {
        activeLoads.push({ ing: ing.name, load, reason, frequency: 'daily' });
        barrierStress += load;
      }
    });
    
    // Apply barrier multiplier to active loads
    barrierStress = Math.round(barrierStress * barrierMod);

    // 6B: Stacking penalty (2+ strong actives)
    const strongActives = selectedIngData.filter(ing => 
      ['RETINOID', 'AHA', 'BHA', 'BPO'].includes(ing.family)
    );
    let stackingPenalty = 0;
    if (strongActives.length >= 2) {
      stackingPenalty = 15;
      barrierStress += stackingPenalty;
    }
    
    // 6C: Frequency penalty (assume daily = +15, skipped for now as we don't track frequency yet)
    
    // 6D: Subtract recovery supports (cap at 20pts max)
    const barrierSupports = [];
    let totalReduction = 0;
    const maxReduction = 20;
    
    selectedIngData.forEach(ing => {
      if (totalReduction >= maxReduction) return;
      
      if (ing.family === 'BARRIER') {
        const reduction = Math.min(8, maxReduction - totalReduction);
        barrierStress = Math.max(0, barrierStress - reduction);
        barrierSupports.push({ ing: ing.name, reduction });
        totalReduction += reduction;
      } else if (ing.family === 'OCCLUSIVE' && (skinType === 'dry' || skinConditions.includes('dehydrated'))) {
        const reduction = Math.min(5, maxReduction - totalReduction);
        barrierStress = Math.max(0, barrierStress - reduction);
        barrierSupports.push({ ing: ing.name, reduction });
        totalReduction += reduction;
      }
    });

    barrierStress = Math.min(100, Math.round(barrierStress));

    // STEP 7: Redundancy Score (duplication-driven)
    // "Am I overdoing similar things with little extra benefit?"
    let redundancyScore = 0;
    const redundancyPatterns = [];
    
    // 2+ exfoliants (AHA/BHA/PHA)
    const exfoliants = selectedIngData.filter(ing => 
      ['AHA', 'BHA', 'PHA'].includes(ing.family)
    );
    if (exfoliants.length >= 2) {
      redundancyScore += 25;
      redundancyPatterns.push({ 
        pattern: 'Multiple exfoliants', 
        ingredients: exfoliants.map(i => i.name), 
        penalty: 25 
      });
    }
    
    // 2+ retinoids
    const retinoids = selectedIngData.filter(ing => ing.family === 'RETINOID');
    if (retinoids.length >= 2) {
      redundancyScore += 30;
      redundancyPatterns.push({ 
        pattern: 'Multiple retinoids', 
        ingredients: retinoids.map(i => i.name), 
        penalty: 30 
      });
    }
    
    // 2+ hydrators
    const hydrators = selectedIngData.filter(ing => ing.family === 'HYDRATOR');
    if (hydrators.length >= 2) {
      redundancyScore += 10;
      redundancyPatterns.push({ 
        pattern: 'Multiple hydrators', 
        ingredients: hydrators.map(i => i.name), 
        penalty: 10 
      });
    }
    
    // Multiple moisturizers
    const moisturizers = selectedIngData.filter(ing => 
      ['OCCLUSIVE', 'BARRIER'].includes(ing.family)
    );
    if (moisturizers.length >= 2) {
      redundancyScore += 15;
      redundancyPatterns.push({ 
        pattern: 'Multiple moisturizers', 
        ingredients: moisturizers.map(i => i.name), 
        penalty: 15 
      });
    }

    redundancyScore = Math.min(100, redundancyScore);

    // OVERALL RISK (weighted average)
    const overallRisk = Math.round((irritationScore * 0.5) + (barrierStress * 0.35) + (redundancyScore * 0.15));

    return {
      irritationRisk: irritationScore,
      barrierStress,
      redundancyScore,
      overallRisk,
      conflictCount: pairRisks.filter(p => p.baseSeverity >= 80).length,
      redundantCount: redundancyPatterns.length,
      activeCount: selectedIngData.length,
      highIrritationCount: strongActives.length,
      confidenceDowngrade,
      irritationMod,
      barrierMod,
      breakdown: {
        irritation: {
          total: irritationScore,
          topPairs: top3Pairs,
          allPairs: pairRisks,
          skinType,
          skinConditions,
          multiplier: irritationMod
        },
        barrier: {
          total: barrierStress,
          activeLoads,
          stackingPenalty,
          barrierSupports,
          activeCount: selectedIngData.length,
          multiplier: barrierMod
        },
        redundancy: {
          total: redundancyScore,
          patterns: redundancyPatterns
        }
      }
    };
  }, [selectedIngredients, ingredients, familyRules, compatibilityRules, skinType, skinConditions, sensitivityLevel, timeOfDay]);

  if (!riskAnalysis) return null;

  const getRiskLevel = (score, applyDowngrade = false) => {
    const thresholds = applyDowngrade 
      ? [30, 60] // More conservative thresholds if confidence downgraded
      : [40, 70]; // Normal thresholds
    
    if (score < thresholds[0]) return { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score < thresholds[1]) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'High', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const overallLevel = getRiskLevel(riskAnalysis.overallRisk, riskAnalysis.confidenceDowngrade);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Risk Card */}
      <div className={cn(
        "p-6 rounded-3xl border-2",
        overallLevel.bg, overallLevel.border
      )}>
        <div className="flex items-center gap-4 mb-4">
            <div className={cn("p-3 rounded-2xl", overallLevel.bg)}>
              <Activity className={cn("w-6 h-6", overallLevel.color)} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-1">Overall Routine Risk</p>
              <div className="flex items-baseline gap-3">
                <span className={cn("text-4xl font-bold", overallLevel.color)}>
                  {riskAnalysis.overallRisk}%
                </span>
                <span className={cn("text-sm font-semibold px-3 py-1 rounded-full", overallLevel.bg, overallLevel.color)}>
                  {overallLevel.label} Risk
                </span>
              </div>
            </div>

          </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-white/70">
            <p className="text-2xl font-bold text-slate-900">{riskAnalysis.activeCount}</p>
            <p className="text-xs text-slate-600">Active Ingredients</p>
          </div>
          <div className="p-3 rounded-xl bg-white/70">
            <p className="text-2xl font-bold text-rose-600">{riskAnalysis.conflictCount}</p>
            <p className="text-xs text-slate-600">Conflicts</p>
          </div>
          <div className="p-3 rounded-xl bg-white/70">
            <p className="text-2xl font-bold text-amber-600">{riskAnalysis.redundantCount}</p>
            <p className="text-xs text-slate-600">Redundancies</p>
          </div>
          <div className="p-3 rounded-xl bg-white/70">
            <p className="text-2xl font-bold text-slate-600">{riskAnalysis.highIrritationCount}</p>
            <p className="text-xs text-slate-600">High Irritation</p>
          </div>
        </div>
      </div>

      {/* Individual Risk Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Irritation Risk */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span className="font-semibold text-slate-900">Irritation Risk</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveBreakdown('irritation')}
              className="rounded-lg h-8"
            >
              <Info className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", getRiskLevel(riskAnalysis.irritationRisk).color)}>
                {riskAnalysis.irritationRisk}%
              </span>
              <span className="text-sm text-slate-500">
                {getRiskLevel(riskAnalysis.irritationRisk).label}
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", 
                riskAnalysis.irritationRisk < 40 ? "bg-emerald-500" :
                riskAnalysis.irritationRisk < 70 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${riskAnalysis.irritationRisk}%` }}
            />
          </div>
        </div>

        {/* Barrier Stress */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-violet-500" />
              <span className="font-semibold text-slate-900">Barrier Stress</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveBreakdown('barrier')}
              className="rounded-lg h-8"
            >
              <Info className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", getRiskLevel(riskAnalysis.barrierStress).color)}>
                {riskAnalysis.barrierStress}%
              </span>
              <span className="text-sm text-slate-500">
                {getRiskLevel(riskAnalysis.barrierStress).label}
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all",
                riskAnalysis.barrierStress < 40 ? "bg-emerald-500" :
                riskAnalysis.barrierStress < 70 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${riskAnalysis.barrierStress}%` }}
            />
          </div>
        </div>

        {/* Redundancy */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Copy className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-900">Redundancy</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveBreakdown('redundancy')}
              className="rounded-lg h-8"
            >
              <Info className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", getRiskLevel(riskAnalysis.redundancyScore).color)}>
                {riskAnalysis.redundancyScore}%
              </span>
              <span className="text-sm text-slate-500">
                {getRiskLevel(riskAnalysis.redundancyScore).label}
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all",
                riskAnalysis.redundancyScore < 40 ? "bg-emerald-500" :
                riskAnalysis.redundancyScore < 70 ? "bg-amber-500" : "bg-slate-500"
              )}
              style={{ width: `${riskAnalysis.redundancyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Warnings */}
      {/* Sensitivity-based warnings */}
      {riskAnalysis.overallRisk > 70 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200"
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900 mb-1">
                {riskAnalysis.confidenceDowngrade ? 'High Risk for Your Skin Sensitivity' : 'High Risk Routine Detected'}
              </p>
              <p className="text-sm text-rose-700">
                {skinType === 'sensitive' || skinConditions.includes('rosacea') || skinConditions.includes('barrier_damaged')
                  ? `Given your ${skinType} skin ${skinConditions.length > 0 ? `and ${skinConditions.join(', ')} conditions` : ''}, this combination may be too aggressive. Consider spacing actives across different days or introducing them gradually.`
                  : 'Consider reducing the number of active ingredients, spacing them out across different days, or consulting with a dermatologist for this combination.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skin sensitivity context */}
      {(riskAnalysis.irritationMod > 1.2 || riskAnalysis.barrierMod > 1.2) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200"
        >
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Adjusted for Your Skin Profile</p>
              <p className="text-sm text-blue-700">
                Risk scores are personalized based on your {skinType} skin type
                {skinConditions.length > 0 && ` and ${skinConditions.join(', ')} conditions`}.
                Your tolerance may be lower than average, so start slowly and monitor your skin's response.
              </p>
              <div className="flex gap-4 mt-2 text-xs text-blue-600">
                <span>Irritation multiplier: {riskAnalysis.irritationMod.toFixed(2)}x</span>
                <span>Barrier multiplier: {riskAnalysis.barrierMod.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {activeBreakdown && (
          <ScoreBreakdownModal 
            type={activeBreakdown}
            breakdown={riskAnalysis.breakdown[activeBreakdown]}
            score={activeBreakdown === 'irritation' ? riskAnalysis.irritationRisk : 
                   activeBreakdown === 'barrier' ? riskAnalysis.barrierStress : 
                   riskAnalysis.redundancyScore}
            onClose={() => setActiveBreakdown(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}