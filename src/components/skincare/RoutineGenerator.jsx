import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sun, Moon, Shield, AlertCircle, Sparkles, Info, Crown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LOAD_CLASSES = {
  HIGH: ['RETINOID', 'AHA', 'BPO'],
  MEDIUM: ['BHA', 'AZELAIC', 'VITC_LAA', 'PEPTIDE'],
  LOW: ['PHA', 'NIACINAMIDE', 'VITC_DERIV', 'HYDRATOR', 'BARRIER']
};

const PM_PREFERRED = ['RETINOID', 'AHA', 'BHA', 'BPO'];
const AM_PREFERRED = ['VITC_LAA', 'VITC_DERIV', 'NIACINAMIDE', 'PEPTIDE', 'AZELAIC'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Goal-based weighting for conflict resolution
const GOAL_WEIGHTS = {
  acne: {
    RETINOID: 0.8, AHA: 1.0, BHA: 1.0, BPO: 1.0, AZELAIC: 0.9, 
    VITC_LAA: 0.3, VITC_DERIV: 0.3, PEPTIDE: 0.2, NIACINAMIDE: 0.7, BARRIER: 0.7
  },
  aging: {
    RETINOID: 1.0, AHA: 0.6, BHA: 0.4, BPO: 0.2, AZELAIC: 0.5,
    VITC_LAA: 0.8, VITC_DERIV: 0.8, PEPTIDE: 0.9, NIACINAMIDE: 0.7, BARRIER: 0.7
  },
  pigmentation: {
    RETINOID: 0.8, AHA: 0.7, BHA: 0.5, BPO: 0.1, AZELAIC: 1.0,
    VITC_LAA: 0.9, VITC_DERIV: 0.9, PEPTIDE: 0.3, NIACINAMIDE: 0.8, BARRIER: 0.8
  },
  rosacea: {
    RETINOID: 0.4, AHA: 0.3, BHA: 0.3, BPO: 0.1, AZELAIC: 0.9,
    VITC_LAA: 0.2, VITC_DERIV: 0.2, PEPTIDE: 0.4, NIACINAMIDE: 0.8, BARRIER: 1.0
  },
  barrier: {
    RETINOID: 0.3, AHA: 0.2, BHA: 0.2, BPO: 0.1, AZELAIC: 0.6,
    VITC_LAA: 0.3, VITC_DERIV: 0.3, PEPTIDE: 0.5, NIACINAMIDE: 0.9, BARRIER: 1.0
  }
};

// Routine archetypes for one-tap mode
const ARCHETYPES = {
  gentle: {
    name: 'Gentle Start',
    maxActives: 1,
    maxExfoliationPerWeek: 1,
    maxRetinoidPerWeek: 2,
    recoveryNights: 4,
    description: 'Start slow with minimal irritation risk'
  },
  balanced: {
    name: 'Balanced Care',
    maxActives: 2,
    maxExfoliationPerWeek: 2,
    maxRetinoidPerWeek: 3,
    recoveryNights: 2,
    description: 'Standard routine for most skin types'
  },
  advanced: {
    name: 'Advanced Actives',
    maxActives: 3,
    maxExfoliationPerWeek: 3,
    maxRetinoidPerWeek: 5,
    recoveryNights: 1,
    description: 'High-intensity routine for experienced users'
  }
};

export default function RoutineGenerator({ 
  selectedIngredients, 
  ingredients, 
  skinType, 
  skinConditions = [], 
  familyRules = [],
  compatibilityRules = [],
  experienceLevel = 'intermediate',
  skinGoal = 'balanced',
  oneTapMode = false,
  progressionState = null,
  isPremium = false
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  // Auto-select archetype for one-tap mode
  const archetype = useMemo(() => {
    if (!oneTapMode) return null;
    
    if (skinConditions.includes('rosacea') || skinConditions.includes('barrier_damaged')) {
      return ARCHETYPES.gentle;
    }
    
    if (experienceLevel === 'beginner') return ARCHETYPES.gentle;
    if (experienceLevel === 'intermediate') return ARCHETYPES.balanced;
    return ARCHETYPES.advanced;
  }, [oneTapMode, experienceLevel, skinConditions]);

  // Apply progression adjustments (Premium only)
  const applyProgressionAdjustments = (actives, baseFrequency) => {
    if (!isPremium || !progressionState) return { actives, frequencyMultiplier: 1 };

    const isPaused = progressionState.paused_until && new Date(progressionState.paused_until) > new Date();
    if (isPaused) {
      // Reduce load by 40% during pause
      return { 
        actives: actives.slice(0, Math.max(1, Math.ceil(actives.length * 0.6))),
        frequencyMultiplier: 0.6 
      };
    }

    // Progressive escalation based on tolerance and stage
    let frequencyMultiplier = 1;
    const stage = progressionState.progression_stage || 1;
    const tolerance = progressionState.tolerance_level || 'MEDIUM';

    // Stage-based frequency increase
    if (stage >= 2 && tolerance !== 'LOW') frequencyMultiplier = 1.2;
    if (stage >= 3 && tolerance === 'HIGH') frequencyMultiplier = 1.4;
    if (stage >= 4 && tolerance === 'HIGH') frequencyMultiplier = 1.6;

    // Tolerance-based modifications
    if (tolerance === 'LOW') {
      frequencyMultiplier *= 0.8;
    } else if (tolerance === 'HIGH' && stage >= 3) {
      // Can add secondary actives if redundancy is low
      const canAddSecondary = actives.length < 3;
      if (canAddSecondary) {
        // Secondary actives would be added by user selection, we just allow more
      }
    }

    return { actives, frequencyMultiplier };
  };

  const routineSchedule = useMemo(() => {
    if (selectedIngredients.length === 0) return null;

    const selectedIngData = selectedIngredients
      .map(ingId => ingredients.find(i => i.id === ingId))
      .filter(Boolean);

    // STEP 1 & 2: Identify actives and classify by load
    const actives = selectedIngData.filter(ing => 
      Object.values(LOAD_CLASSES).flat().includes(ing.family)
    );

    const highLoadActives = actives.filter(ing => LOAD_CLASSES.HIGH.includes(ing.family));
    const mediumLoadActives = actives.filter(ing => LOAD_CLASSES.MEDIUM.includes(ing.family));
    const lowLoadActives = actives.filter(ing => LOAD_CLASSES.LOW.includes(ing.family));

    // Apply progression adjustments
    const { actives: adjustedActives, frequencyMultiplier } = applyProgressionAdjustments(actives, 1);

    // Apply one-tap archetype constraints if enabled
    let filteredActives = adjustedActives;
    if (archetype && adjustedActives.length > archetype.maxActives) {
      // Use goal weights to prioritize which actives to keep
      const goalWeights = GOAL_WEIGHTS[skinGoal] || GOAL_WEIGHTS.acne;
      
      filteredActives = adjustedActives
        .map(ing => ({
          ing,
          priority: (goalWeights[ing.family] || 0.5) * (4 - ing.potency) // higher weight + lower potency = safer priority
        }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, archetype.maxActives)
        .map(item => item.ing);
    }

    // STEP 3: Check for conflicts using rules
    const conflicts = [];
    for (let i = 0; i < filteredActives.length; i++) {
      for (let j = i + 1; j < filteredActives.length; j++) {
        const ingA = filteredActives[i];
        const ingB = filteredActives[j];
        
        // Check ingredient-specific rule
        let rule = compatibilityRules.find(r =>
          (r.ingredient_a_id === ingA.id && r.ingredient_b_id === ingB.id) ||
          (r.ingredient_a_id === ingB.id && r.ingredient_b_id === ingA.id)
        );
        
        // Check family rule
        if (!rule) {
          const [famA, famB] = [ingA.family, ingB.family].sort();
          rule = familyRules.find(r =>
            r.family_a === famA && r.family_b === famB
          );
        }
        
        if (rule && rule.relationship === 'CONFLICT') {
          conflicts.push({ ingA, ingB, severity: rule.severity, mechanism: rule.mechanism });
        }
      }
    }

    // STEP 4 & 5: Assign AM/PM based on preferences and conflicts
    const amActives = [];
    const pmActives = [];
    const assigned = new Set();

    // First pass: assign PM-preferred actives to PM
    filteredActives.forEach(ing => {
      if (PM_PREFERRED.includes(ing.family)) {
        pmActives.push(ing);
        assigned.add(ing.id);
      }
    });

    // Second pass: assign remaining actives to AM if no conflicts
    filteredActives.forEach(ing => {
      if (assigned.has(ing.id)) return;
      
      // Check if conflicts with any PM active
      const conflictsWithPM = conflicts.some(c => 
        (c.ingA.id === ing.id && pmActives.some(p => p.id === c.ingB.id)) ||
        (c.ingB.id === ing.id && pmActives.some(p => p.id === c.ingA.id))
      );
      
      if (!conflictsWithPM && AM_PREFERRED.includes(ing.family)) {
        amActives.push(ing);
        assigned.add(ing.id);
      }
    });

    // Third pass: remaining go to PM (alternating schedule)
    const alternatingActives = filteredActives.filter(ing => !assigned.has(ing.id));

    // STEP 6: Assign frequencies based on load and skin sensitivity
    const getFrequency = (ing) => {
      const isHighSensitivity = skinType === 'sensitive' || 
        skinConditions.includes('rosacea') || 
        skinConditions.includes('barrier_damaged');
      
      let baseFreq;
      
      if (LOAD_CLASSES.HIGH.includes(ing.family)) {
        if (experienceLevel === 'beginner') baseFreq = 2;
        else if (experienceLevel === 'intermediate') baseFreq = 3;
        else baseFreq = 5;
      } else if (LOAD_CLASSES.MEDIUM.includes(ing.family)) {
        baseFreq = experienceLevel === 'beginner' ? 3 : 4;
      } else {
        baseFreq = 7; // daily
      }
      
      // Reduce for sensitive skin
      if (isHighSensitivity) {
        baseFreq = Math.max(2, Math.ceil(baseFreq * 0.6));
      }

      // Apply progression multiplier (Premium feature)
      if (isPremium && frequencyMultiplier !== 1) {
        baseFreq = Math.min(7, Math.round(baseFreq * frequencyMultiplier));
      }
      
      return baseFreq;
    };

    // STEP 7: Enforce recovery nights
    let recoveryNights;
    if (archetype) {
      recoveryNights = archetype.recoveryNights;
    } else {
      const needsRecovery = highLoadActives.length >= 2 || 
        skinConditions.includes('barrier_damaged');
      recoveryNights = needsRecovery ? 2 : 1;
    }

    // Add extra recovery during progression pause
    const isPaused = progressionState?.paused_until && new Date(progressionState.paused_until) > new Date();
    if (isPaused) {
      recoveryNights = Math.max(recoveryNights, 3);
    }

    // STEP 8 & 9: Build weekly schedule with smart distribution
    const allPMActives = [...pmActives, ...alternatingActives];
    const totalPMDays = 7 - recoveryNights;
    
    // Distribute actives across available nights, avoiding back-to-back high-load
    const activeSchedule = [];
    const isHighLoad = (ing) => LOAD_CLASSES.HIGH.includes(ing.family);
    
    let activeRotation = [...allPMActives];
    for (let i = 0; i < totalPMDays; i++) {
      if (activeRotation.length === 0) {
        activeSchedule.push(null);
        continue;
      }
      
      // Pick next active, preferring non-high-load if last night was high-load
      const lastWasHighLoad = i > 0 && activeSchedule[i-1] && isHighLoad(activeSchedule[i-1]);
      
      let nextActive;
      if (lastWasHighLoad && activeRotation.some(a => !isHighLoad(a))) {
        // Prefer low/medium load after high load
        const lowLoadOptions = activeRotation.filter(a => !isHighLoad(a));
        nextActive = lowLoadOptions[0];
      } else {
        nextActive = activeRotation[0];
      }
      
      activeSchedule.push(nextActive);
      activeRotation = activeRotation.filter(a => a.id !== nextActive.id);
      if (activeRotation.length === 0) activeRotation = [...allPMActives];
    }
    
    // Insert recovery nights strategically (after high-load nights when possible)
    const weeklySchedule = [];
    let activeIdx = 0;
    let recoveryInserted = 0;
    
    for (let i = 0; i < 7; i++) {
      const day = DAYS[i];
      const am = {
        actives: [...amActives],
        supports: selectedIngData.filter(ing => 
          ['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(ing.family) && 
          !filteredActives.some(a => a.id === ing.id)
        )
      };
      
      // Determine if this should be a recovery night
      const shouldBeRecovery = recoveryInserted < recoveryNights && 
        (i >= totalPMDays || 
         (activeIdx > 0 && activeSchedule[activeIdx - 1] && isHighLoad(activeSchedule[activeIdx - 1])));
      
      if (shouldBeRecovery && recoveryInserted < recoveryNights) {
        weeklySchedule.push({
          day,
          am,
          pm: {
            isRecovery: true,
            supports: selectedIngData.filter(ing => 
              ['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(ing.family)
            )
          }
        });
        recoveryInserted++;
      } else if (activeIdx < activeSchedule.length) {
        weeklySchedule.push({
          day,
          am,
          pm: {
            actives: activeSchedule[activeIdx] ? [activeSchedule[activeIdx]] : [],
            supports: selectedIngData.filter(ing => 
              ['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(ing.family) && 
              !filteredActives.some(a => a.id === ing.id)
            )
          }
        });
        activeIdx++;
      } else {
        // Fill remaining with recovery
        weeklySchedule.push({
          day,
          am,
          pm: {
            isRecovery: true,
            supports: selectedIngData.filter(ing => 
              ['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(ing.family)
            )
          }
        });
        recoveryInserted++;
      }
    }

    return {
      schedule: weeklySchedule,
      archetype,
      stats: {
        totalActives: filteredActives.length,
        highLoad: highLoadActives.length,
        conflicts: conflicts.length,
        recoveryNights,
        amActives: amActives.length,
        pmActives: pmActives.length + alternatingActives.length
      },
      explanations: {
        archetype: archetype ? `Using ${archetype.name} template for safety` : null,
        progression: isPremium && progressionState ? 
          (isPaused ? 'Goal change detected: reduced load by 40% + added recovery nights' :
           frequencyMultiplier > 1 ? `Tolerance HIGH: increased frequency by ${Math.round((frequencyMultiplier - 1) * 100)}%` :
           frequencyMultiplier < 1 ? 'Building tolerance: conservative frequency' :
           'Maintaining current progression stage') : null,
        pmPlacement: pmActives.map(ing => `${ing.name} placed in PM due to photosensitivity/irritation risk`),
        amPlacement: amActives.map(ing => `${ing.name} placed in AM for antioxidant/brightening benefits`),
        conflicts: conflicts.map(c => `${c.ingA.name} and ${c.ingB.name} separated to avoid ${c.mechanism.toLowerCase()}`),
        recovery: `${recoveryNights} recovery nights/week to prevent barrier damage`,
        distribution: 'Actives distributed to avoid back-to-back high-load nights'
      }
    };
  }, [selectedIngredients, ingredients, skinType, skinConditions, familyRules, compatibilityRules, experienceLevel]);

  if (!routineSchedule) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-200">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">Select ingredients to generate your routine</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Archetype Badge */}
      {routineSchedule.archetype && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
            <div>
              <p className="font-semibold text-violet-900 mb-1">{routineSchedule.archetype.name}</p>
              <p className="text-sm text-violet-700">{routineSchedule.archetype.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{routineSchedule.stats.totalActives}</p>
          <p className="text-sm text-slate-600">Total Actives</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200">
          <p className="text-2xl font-bold text-violet-600">{routineSchedule.stats.amActives}</p>
          <p className="text-sm text-slate-600">AM Actives</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200">
          <p className="text-2xl font-bold text-indigo-600">{routineSchedule.stats.pmActives}</p>
          <p className="text-sm text-slate-600">PM Actives</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200">
          <p className="text-2xl font-bold text-emerald-600">{routineSchedule.stats.recoveryNights}</p>
          <p className="text-sm text-slate-600">Recovery Nights</p>
        </div>
      </div>

      {/* Explanation Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full rounded-2xl border-2"
      >
        <Info className="w-4 h-4 mr-2" />
        {showExplanation ? 'Hide' : 'Show'} Routine Logic
      </Button>

      {/* Explanations */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 space-y-3"
        >
          <div>
            <p className="font-semibold text-blue-900 mb-2">AM Placement</p>
            {routineSchedule.explanations.amPlacement.length > 0 ? (
              <ul className="text-sm text-blue-700 space-y-1">
                {routineSchedule.explanations.amPlacement.map((exp, i) => (
                  <li key={i}>• {exp}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-blue-700">No AM-specific actives</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">PM Placement</p>
            {routineSchedule.explanations.pmPlacement.length > 0 ? (
              <ul className="text-sm text-blue-700 space-y-1">
                {routineSchedule.explanations.pmPlacement.map((exp, i) => (
                  <li key={i}>• {exp}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-blue-700">No PM-specific actives</p>
            )}
          </div>
          {routineSchedule.explanations.conflicts.length > 0 && (
            <div>
              <p className="font-semibold text-blue-900 mb-2">Conflict Resolution</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {routineSchedule.explanations.conflicts.map((exp, i) => (
                  <li key={i}>• {exp}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="font-semibold text-blue-900 mb-2">Recovery Strategy</p>
            <p className="text-sm text-blue-700">• {routineSchedule.explanations.recovery}</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">Distribution Logic</p>
            <p className="text-sm text-blue-700">• {routineSchedule.explanations.distribution}</p>
          </div>
          {routineSchedule.explanations.archetype && (
            <div>
              <p className="font-semibold text-blue-900 mb-2">Template</p>
              <p className="text-sm text-blue-700">• {routineSchedule.explanations.archetype}</p>
            </div>
          )}
          {routineSchedule.explanations.progression && (
            <div>
              <p className="font-semibold text-blue-900 mb-2">Adaptive Progression</p>
              <p className="text-sm text-blue-700">• {routineSchedule.explanations.progression}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Weekly Schedule - Premium Only */}
      {!isPremium ? (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-violet-50 border-2 border-slate-200 text-center">
          <div className="max-w-2xl mx-auto">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Weekly Calendar Requires Time-Based Tracking
            </h3>
            <p className="text-slate-600 mb-6">
              The 7-day rotation schedule adapts based on your skin's response over time. 
              This feature requires continuous tracking to ensure safe progression.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6 text-left">
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-violet-600 mb-2" />
                <p className="font-semibold text-slate-900 mb-1">Smart Day-by-Day Planning</p>
                <p className="text-sm text-slate-600">Actives rotated to prevent overload</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-violet-600 mb-2" />
                <p className="font-semibold text-slate-900 mb-1">Strategic Recovery Nights</p>
                <p className="text-sm text-slate-600">Barrier repair scheduled optimally</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-violet-600 mb-2" />
                <p className="font-semibold text-slate-900 mb-1">Conflict-Free Distribution</p>
                <p className="text-sm text-slate-600">No back-to-back high-load nights</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-violet-600 mb-2" />
                <p className="font-semibold text-slate-900 mb-1">Auto-Adjusting Schedule</p>
                <p className="text-sm text-slate-600">Adapts based on your tolerance</p>
              </div>
            </div>
            <Link to={createPageUrl('Subscription')}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl px-8">
                <Crown className="w-5 h-5 mr-2" />
                Enable Tracking Features
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">7-Day Schedule</h3>
          <div className="grid gap-4">
            {routineSchedule.schedule.map((daySchedule, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-white border-2 border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-900">{daySchedule.day}</h4>
                <div className="flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    <Sun className="w-3 h-3 inline mr-1" />
                    AM
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    daySchedule.pm.isRecovery 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-indigo-100 text-indigo-700"
                  )}>
                    {daySchedule.pm.isRecovery ? (
                      <>
                        <Shield className="w-3 h-3 inline mr-1" />
                        Recovery
                      </>
                    ) : (
                      <>
                        <Moon className="w-3 h-3 inline mr-1" />
                        PM
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* AM */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Morning</p>
                  <div className="space-y-2">
                    {daySchedule.am.actives.length > 0 && (
                      <div>
                        <p className="text-xs text-violet-600 font-medium mb-1">Actives:</p>
                        {daySchedule.am.actives.map(ing => (
                          <div key={ing.id} className="px-3 py-1.5 rounded-lg bg-violet-50 text-sm text-slate-900">
                            {ing.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {daySchedule.am.supports.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">Support:</p>
                        <div className="flex flex-wrap gap-1">
                          {daySchedule.am.supports.map(ing => (
                            <span key={ing.id} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                              {ing.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PM */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Evening</p>
                  {daySchedule.pm.isRecovery ? (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-900">Recovery Night</p>
                      </div>
                      <p className="text-xs text-emerald-700 mb-2">
                        No exfoliants or retinoids. Focus on barrier repair.
                      </p>
                      {daySchedule.pm.supports.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {daySchedule.pm.supports.map(ing => (
                            <span key={ing.id} className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                              {ing.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySchedule.pm.actives.length > 0 && (
                        <div>
                          <p className="text-xs text-indigo-600 font-medium mb-1">Actives:</p>
                          {daySchedule.pm.actives.map(ing => (
                            <div key={ing.id} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-sm text-slate-900">
                              {ing.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {daySchedule.pm.supports.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Support:</p>
                          <div className="flex flex-wrap gap-1">
                            {daySchedule.pm.supports.map(ing => (
                              <span key={ing.id} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                                {ing.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
          <div>
            <p className="font-semibold text-violet-900 mb-2">Pro Tips</p>
            <ul className="text-sm text-violet-700 space-y-1">
              <li>• Start with 2-3x/week for new actives, then increase as tolerated</li>
              <li>• Always apply thinnest to thickest consistency</li>
              <li>• Wait 1-2 minutes between active steps for better absorption</li>
              <li>• Never skip recovery nights - your barrier needs time to repair</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}