import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const familyInfo = {
  RETINOID: { 
    label: 'Retinoids', 
    emoji: '🔬',
    description: 'Vitamin A derivatives that accelerate cell turnover, boost collagen production, and reduce fine lines. Gold standard for anti-aging.',
    mechanism: 'Binds to retinoic acid receptors to stimulate cellular renewal'
  },
  AHA: { 
    label: 'AHAs', 
    emoji: '✨',
    description: 'Alpha Hydroxy Acids that exfoliate the skin surface, improve texture, and boost radiance. Water-soluble acids.',
    mechanism: 'Dissolves bonds between dead skin cells for surface exfoliation'
  },
  BHA: { 
    label: 'BHA', 
    emoji: '🧪',
    description: 'Beta Hydroxy Acid (Salicylic Acid) that penetrates pores to clear congestion. Oil-soluble, ideal for acne-prone skin.',
    mechanism: 'Penetrates oil to exfoliate inside pores and reduce inflammation'
  },
  PHA: { 
    label: 'PHAs', 
    emoji: '🌿',
    description: 'Polyhydroxy Acids with larger molecules for gentler exfoliation. Less irritating than AHAs, suitable for sensitive skin.',
    mechanism: 'Surface exfoliation with added humectant properties'
  },
  BPO: { 
    label: 'Benzoyl Peroxide', 
    emoji: '⚡',
    description: 'Powerful acne treatment that kills acne bacteria and reduces inflammation. Can be drying.',
    mechanism: 'Releases oxygen to kill anaerobic P. acnes bacteria'
  },
  NIACINAMIDE: { 
    label: 'Niacinamide', 
    emoji: '💧',
    description: 'Vitamin B3 that strengthens barrier, reduces inflammation, controls oil, and brightens skin. Highly versatile.',
    mechanism: 'Enhances ceramide production and reduces sebum'
  },
  VITC_LAA: { 
    label: 'Vitamin C (LAA)', 
    emoji: '🍊',
    description: 'L-Ascorbic Acid, the most potent form of Vitamin C. Brightens, protects against free radicals, boosts collagen.',
    mechanism: 'Antioxidant that neutralizes free radicals and inhibits melanin'
  },
  VITC_DERIV: { 
    label: 'Vitamin C Derivatives', 
    emoji: '🌟',
    description: 'Stable derivatives like MAP, SAP, and Ethyl Ascorbic Acid. Less potent but more stable than L-AA.',
    mechanism: 'Converts to ascorbic acid in skin for antioxidant benefits'
  },
  AZELAIC: { 
    label: 'Azelaic Acid', 
    emoji: '🌸',
    description: 'Multi-functional acid that treats acne, rosacea, and hyperpigmentation. Anti-inflammatory and antibacterial.',
    mechanism: 'Inhibits tyrosinase, kills bacteria, and reduces inflammation'
  },
  PEPTIDE: { 
    label: 'Peptides', 
    emoji: '🔗',
    description: 'Amino acid chains that signal skin to produce collagen, improve firmness, and reduce wrinkles.',
    mechanism: 'Signals fibroblasts to synthesize collagen and elastin'
  },
  BARRIER: { 
    label: 'Barrier Repair', 
    emoji: '🛡️',
    description: 'Ingredients that repair and strengthen the skin\'s protective barrier (ceramides, cholesterol, fatty acids).',
    mechanism: 'Replenishes lipids in the stratum corneum'
  },
  HYDRATOR: { 
    label: 'Hydrators', 
    emoji: '💦',
    description: 'Humectants that draw water into skin (hyaluronic acid, glycerin). Essential for plump, hydrated skin.',
    mechanism: 'Attracts and binds water molecules to the skin'
  },
  OCCLUSIVE: { 
    label: 'Occlusives', 
    emoji: '🔒',
    description: 'Sealants that prevent water loss (petrolatum, dimethicone). Lock in moisture.',
    mechanism: 'Forms a protective barrier to prevent transepidermal water loss'
  }
};

const ingredientOptions = {
  RETINOID: [
    { name: 'Retinol', concentrations: ['0.25%', '0.5%', '1%'], note: 'Most common OTC retinoid, converts to retinoic acid' },
    { name: 'Retinaldehyde', concentrations: ['0.05%', '0.1%'], note: 'One conversion step from retinoic acid, faster results' },
    { name: 'Tretinoin', concentrations: ['0.025%', '0.05%', '0.1%'], note: 'Prescription strength, direct retinoic acid' }
  ],
  AHA: [
    { name: 'Glycolic Acid', concentrations: ['5%', '7%', '10%'], note: 'Smallest molecule, deepest penetration' },
    { name: 'Lactic Acid', concentrations: ['5%', '10%'], note: 'Gentler, hydrating properties' },
    { name: 'Mandelic Acid', concentrations: ['5%', '10%'], note: 'Largest molecule, best for sensitive skin' }
  ],
  BHA: [
    { name: 'Salicylic Acid', concentrations: ['0.5%', '1%', '2%'], note: 'Only BHA commonly used, oil-soluble' }
  ],
  PHA: [
    { name: 'Gluconolactone', concentrations: ['5%', '10%'], note: 'Gentle exfoliant with antioxidant benefits' },
    { name: 'Lactobionic Acid', concentrations: ['5%', '10%'], note: 'Humectant properties, less irritating' }
  ],
  BPO: [
    { name: 'Benzoyl Peroxide', concentrations: ['2.5%', '5%', '10%'], note: 'Kills acne bacteria, can bleach fabrics' }
  ],
  NIACINAMIDE: [
    { name: 'Niacinamide', concentrations: ['5%', '10%', '15%'], note: 'Multi-functional, well-tolerated' }
  ],
  VITC_LAA: [
    { name: 'Ascorbic Acid', concentrations: ['10%', '15%', '20%'], note: 'Most potent but unstable, requires low pH' }
  ],
  VITC_DERIV: [
    { name: 'Ethyl Ascorbic Acid', concentrations: ['10%', '15%'], note: 'Stable, brightening, less irritating' },
    { name: 'MAP', concentrations: ['10%', '15%'], note: 'Magnesium Ascorbyl Phosphate, very stable' },
    { name: 'SAP', concentrations: ['10%', '15%'], note: 'Sodium Ascorbyl Phosphate, acne benefits' }
  ],
  AZELAIC: [
    { name: 'Azelaic Acid', concentrations: ['10%', '15%', '20%'], note: 'Multi-mechanism: acne, rosacea, brightening' }
  ],
  PEPTIDE: [
    { name: 'Matrixyl', concentrations: ['3%', '5%'], note: 'Stimulates collagen production' },
    { name: 'Argireline', concentrations: ['5%', '10%'], note: 'Muscle-relaxing, reduces expression lines' }
  ],
  BARRIER: [
    { name: 'Ceramides', concentrations: ['2%', '5%'], note: 'Key lipid in skin barrier structure' },
    { name: 'Cholesterol', concentrations: ['2%', '5%'], note: 'Essential for barrier lipid matrix' }
  ],
  HYDRATOR: [
    { name: 'Hyaluronic Acid', concentrations: ['1%', '2%'], note: 'Holds 1000x its weight in water' },
    { name: 'Glycerin', concentrations: ['3%', '5%'], note: 'Classic humectant, well-tolerated' }
  ],
  OCCLUSIVE: [
    { name: 'Petrolatum', concentrations: ['5%', '10%'], note: 'Most effective occlusive, prevents water loss' },
    { name: 'Dimethicone', concentrations: ['2%', '5%'], note: 'Silicone-based, lightweight feel' }
  ]
};

export default function ActiveInstanceModal({ family, existingInstance, onSave, onClose, isPremium }) {
  const [strength, setStrength] = useState(existingInstance?.strength || 'medium');
  const [selectedIngredient, setSelectedIngredient] = useState(existingInstance?.ingredient_name || null);
  const [selectedConcentration, setSelectedConcentration] = useState(existingInstance?.concentration || null);
  const [frequency, setFrequency] = useState(existingInstance?.frequency || 'daily');
  const [timeOfDay, setTimeOfDay] = useState(existingInstance?.time_of_day || 'pm');
  const [progressionMode, setProgressionMode] = useState(existingInstance?.progression_mode || 'standard');

  const info = familyInfo[family] || { label: family, emoji: '💊' };
  const options = ingredientOptions[family] || [];

  const handleSave = () => {
    onSave({
      family,
      ...(isPremium ? {
        ingredient_name: selectedIngredient,
        concentration: selectedConcentration,
        progression_mode: progressionMode
      } : {
        strength
      }),
      frequency,
      time_of_day: timeOfDay
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info.emoji}</span>
            <h2 className="text-2xl font-bold text-slate-900">{info.label}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Family Description (Premium) */}
        {isPremium && info.description && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed mb-2">{info.description}</p>
            {info.mechanism && (
              <p className="text-xs text-slate-600 italic">
                <strong>Mechanism:</strong> {info.mechanism}
              </p>
            )}
          </div>
        )}

        {/* Ingredient & Concentration Selection (Premium) */}
        {isPremium ? (
          <>
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-3 block">Select Ingredient</label>
              <div className="space-y-2">
                {options.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => {
                      setSelectedIngredient(opt.name);
                      setSelectedConcentration(opt.concentrations[0]);
                    }}
                    className={cn(
                      "w-full p-3 rounded-2xl border-2 transition-all text-left",
                      selectedIngredient === opt.name
                        ? "border-violet-500 bg-violet-50 text-violet-900"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <p className="font-semibold text-sm">{opt.name}</p>
                    {opt.note && (
                      <p className="text-xs text-slate-600 mt-1">{opt.note}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedIngredient && (
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-3 block">Concentration</label>
                <div className="flex gap-2">
                  {options.find(o => o.name === selectedIngredient)?.concentrations.map(conc => (
                    <button
                      key={conc}
                      onClick={() => setSelectedConcentration(conc)}
                      className={cn(
                        "flex-1 p-3 rounded-2xl border-2 transition-all",
                        selectedConcentration === conc
                          ? "border-violet-500 bg-violet-50 text-violet-900"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <p className="font-semibold text-sm">{conc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-3 block">Strength</label>
            <div className="grid grid-cols-3 gap-3">
              {['mild', 'medium', 'strong'].map(level => (
                <button
                  key={level}
                  onClick={() => setStrength(level)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all capitalize",
                    strength === level
                      ? "border-violet-500 bg-violet-50 text-violet-900"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-1.5 justify-center mb-1">
                    {[...Array(level === 'mild' ? 1 : level === 'medium' ? 2 : 3)].map((_, i) => (
                      <div key={i} className={cn(
                        "w-2 h-2 rounded-full",
                        strength === level ? "bg-violet-500" : "bg-slate-400"
                      )} />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{level}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frequency Selection */}
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-3 block">Frequency</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '2x_week', label: '2x/week' },
              { value: 'alternate', label: 'Alternate' },
              { value: 'daily', label: 'Daily' }
            ].map(freq => (
              <button
                key={freq.value}
                onClick={() => setFrequency(freq.value)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all",
                  frequency === freq.value
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <p className="font-semibold text-sm">{freq.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time of Day Selection */}
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-3 block">Time of Day</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTimeOfDay('am')}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all",
                timeOfDay === 'am'
                  ? "border-amber-500 bg-amber-50 text-amber-900"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="font-semibold text-sm">Morning</p>
            </button>
            <button
              onClick={() => setTimeOfDay('pm')}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all",
                timeOfDay === 'pm'
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <p className="font-semibold text-sm">Evening</p>
            </button>
          </div>
        </div>

        {/* Premium: Progression Mode */}
        {isPremium && (
          <div>
            <label className="text-sm font-semibold text-slate-900 mb-3 block">Progression Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProgressionMode('standard')}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all",
                  progressionMode === 'standard'
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <p className="font-semibold text-sm mb-1">Standard</p>
                <p className="text-xs text-slate-500">Auto-adjust weekly</p>
              </button>
              <button
                onClick={() => setProgressionMode('locked')}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all",
                  progressionMode === 'locked'
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <p className="font-semibold text-sm mb-1">Locked</p>
                <p className="text-xs text-slate-500">Keep current level</p>
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-700"
        >
          {existingInstance ? 'Update' : 'Add to Routine'}
        </Button>
      </motion.div>
    </div>
  );
}