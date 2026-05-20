import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const PM_PREFERRED = ['RETINOID', 'AHA', 'BHA', 'BPO'];
const AM_PREFERRED = ['VITC_LAA', 'VITC_DERIV', 'NIACINAMIDE', 'PEPTIDE', 'AZELAIC'];

export default function StaticRoutineSuggestion({ selectedIngredients, ingredients, skinType, skinConditions = [] }) {
  // Categorize ingredients
  const selectedIngData = selectedIngredients
    .map(ingId => ingredients.find(i => i.id === ingId))
    .filter(Boolean);

  const actives = selectedIngData.filter(ing => 
    ['RETINOID', 'AHA', 'BHA', 'PHA', 'BPO', 'AZELAIC', 'VITC_LAA', 'VITC_DERIV', 'NIACINAMIDE', 'PEPTIDE'].includes(ing.family)
  );

  const supports = selectedIngData.filter(ing => 
    ['BARRIER', 'HYDRATOR', 'OCCLUSIVE'].includes(ing.family)
  );

  // Simple AM/PM split
  const amActives = actives.filter(ing => AM_PREFERRED.includes(ing.family));
  const pmActives = actives.filter(ing => PM_PREFERRED.includes(ing.family));

  const highLoad = actives.filter(ing => ['RETINOID', 'AHA', 'BPO'].includes(ing.family));

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Static Routine Snapshot</p>
            <p className="text-sm text-blue-700">
              This is a safe starting point based on your current selection. For time-based rotation 
              and adaptive scheduling, tracking features are required.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AM Routine */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-amber-100">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Morning Routine</h3>
              <p className="text-sm text-slate-500">Antioxidants & Protection</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 mb-2">STEP 1: CLEANSER</p>
              <p className="text-sm text-slate-700">Gentle cleanser suited to your skin type</p>
            </div>

            {amActives.length > 0 && (
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
                <p className="text-xs font-semibold text-violet-600 mb-2">STEP 2: ACTIVES</p>
                <div className="space-y-1">
                  {amActives.map(ing => (
                    <p key={ing.id} className="text-sm text-slate-900">• {ing.name}</p>
                  ))}
                </div>
              </div>
            )}

            {supports.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 mb-2">STEP 3: HYDRATION</p>
                <div className="space-y-1">
                  {supports.slice(0, 2).map(ing => (
                    <p key={ing.id} className="text-sm text-slate-700">• {ing.name}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-semibold text-amber-700 mb-1">STEP 4: SUNSCREEN</p>
              <p className="text-xs text-amber-600">SPF 30+ (broad spectrum)</p>
            </div>
          </div>
        </div>

        {/* PM Routine */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-100">
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Evening Routine</h3>
              <p className="text-sm text-slate-500">Treatment & Repair</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 mb-2">STEP 1: CLEANSER</p>
              <p className="text-sm text-slate-700">Double cleanse if wearing sunscreen/makeup</p>
            </div>

            {pmActives.length > 0 ? (
              <>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-600 mb-2">STEP 2: ACTIVES (Rotate)</p>
                  <div className="space-y-1 mb-2">
                    {pmActives.map(ing => (
                      <p key={ing.id} className="text-sm text-slate-900">• {ing.name}</p>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-600">
                    {highLoad.length >= 2 
                      ? "Use these on different nights. Start 2-3x/week."
                      : "Start with every other night, then increase as tolerated."}
                  </p>
                </div>

                {skinConditions.includes('barrier_damaged') || skinConditions.includes('rosacea') ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-700">RECOVERY NIGHTS</p>
                    </div>
                    <p className="text-xs text-emerald-600">
                      Take 3-4 recovery nights per week with no actives - just barrier repair.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 mb-1">STEP 2: TREATMENT</p>
                <p className="text-sm text-slate-700">No strong actives selected for PM</p>
              </div>
            )}

            {supports.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 mb-2">STEP 3: MOISTURIZE</p>
                <div className="space-y-1">
                  {supports.map(ing => (
                    <p key={ing.id} className="text-sm text-slate-700">• {ing.name}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
          <div>
            <p className="font-semibold text-violet-900 mb-2">Getting Started</p>
            <ul className="text-sm text-violet-700 space-y-1">
              <li>• Start with 2-3 applications per week for new actives</li>
              <li>• Wait 1-2 minutes between active steps</li>
              <li>• Listen to your skin - reduce frequency if irritation occurs</li>
              {highLoad.length >= 2 && (
                <li>• Never use multiple strong actives on the same night when starting</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}