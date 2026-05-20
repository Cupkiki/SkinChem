import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Sun, Moon, GripVertical, ArrowRight, Clock, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const categoryIcons = {
  retinoid: '🔬', vitamin_c: '🍊', aha: '✨', bha: '🧪', niacinamide: '💧',
  peptide: '🧬', hyaluronic_acid: '💦', ceramide: '🛡️', antioxidant: '🍇',
  enzyme: '🌿', benzoyl_peroxide: '⚡', azelaic_acid: '🌸', salicylic_acid: '🧴',
  glycolic_acid: '💫', lactic_acid: '🥛', kojic_acid: '🍄', arbutin: '🌺',
  tranexamic_acid: '💎', zinc: '🔘', sulfur: '🌋', tea_tree: '🌲',
  centella: '🌱', bakuchiol: '🌿', squalane: '💧', copper_peptide: '🔶',
  egf: '🧬', spf: '☀️', hydroquinone: '⚪', mandelic_acid: '🍑'
};

// Recommended order for skincare routine
const routineOrder = {
  am: ['cleanser', 'vitamin_c', 'antioxidant', 'niacinamide', 'hyaluronic_acid', 'azelaic_acid', 'peptide', 'ceramide', 'squalane', 'spf'],
  pm: ['cleanser', 'aha', 'bha', 'glycolic_acid', 'lactic_acid', 'mandelic_acid', 'retinoid', 'bakuchiol', 'niacinamide', 'hyaluronic_acid', 'peptide', 'ceramide', 'squalane']
};

export default function RoutineBuilder({ selectedIngredients, ingredients, timeOfDay = 'am', skinConditions = [] }) {
  const [orderedIngredients, setOrderedIngredients] = useState(selectedIngredients);

  // Filter selected ingredients
  const suitableIngredients = ingredients.filter(ing => 
    selectedIngredients.includes(ing.id)
  );

  // Sort by recommended routine order
  const sortedIngredients = [...suitableIngredients].sort((a, b) => {
    const orderA = routineOrder[timeOfDay].indexOf(a.category);
    const orderB = routineOrder[timeOfDay].indexOf(b.category);
    return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
  });

  // Frequency recommendations based on potency and irritation
  const getFrequencyRecommendation = (ingredient) => {
    const hasBarrierIssue = skinConditions.includes('barrier_damaged');
    const hasSensitivity = skinConditions.includes('rosacea');
    
    if (ingredient.potency >= 3 || ingredient.irritation_base > 50) {
      if (hasBarrierIssue || hasSensitivity) {
        return '2-3x per week';
      }
      return 'Start 2x/week, build tolerance';
    }
    if (ingredient.potency >= 2 || ingredient.irritation_base > 25) {
      if (hasBarrierIssue) {
        return 'Every other day';
      }
      return 'Daily or as tolerated';
    }
    return 'Daily';
  };

  // Check if recovery days are needed
  const needsRecoveryDay = sortedIngredients.some(i => i.potency >= 3 || i.irritation_base > 50) && 
                           (skinConditions.includes('barrier_damaged') || skinConditions.includes('rosacea'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {timeOfDay === 'am' ? (
            <div className="p-3 rounded-2xl bg-amber-100">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-indigo-100">
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {timeOfDay === 'am' ? 'Morning Routine' : 'Evening Routine'}
            </h3>
            <p className="text-sm text-slate-500">
              Optimized order for maximum efficacy
            </p>
          </div>
        </div>

      </div>

      {sortedIngredients.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No ingredients selected for {timeOfDay === 'am' ? 'morning' : 'evening'} routine</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedIngredients.map((ingredient, index) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold">
                  {index + 1}
                </div>
                
                <span className="text-2xl">{categoryIcons[ingredient.category] || '💊'}</span>
                
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{ingredient.name}</p>
                  <p className="text-sm text-slate-500 capitalize">{ingredient.family?.replace(/_/g, ' ')}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-violet-600 font-medium">{getFrequencyRecommendation(ingredient)}</p>
                  </div>
                </div>
              </div>
              
              {index < sortedIngredients.length - 1 && (
                <div className="absolute left-7 top-full h-3 w-0.5 bg-slate-200" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {sortedIngredients.length > 0 && (
        <>
          {needsRecoveryDay && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Recovery Days Recommended</p>
                  <p className="text-sm text-amber-700">
                    Given your skin condition and potent actives, consider taking recovery days between uses 
                    to prevent barrier damage and irritation.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">Pro Tip</p>
                <p className="text-sm text-emerald-700">
                  {timeOfDay === 'am' 
                    ? "Always finish with SPF 30+ as your last step. Apply generously and reapply every 2 hours when outdoors."
                    : "Give actives time to work overnight. Consider buffering strong actives with moisturizer if you're new to them."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}