import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Shield, Sparkles, Droplet, Lock, Crown, ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categoryIcons = {
  active: '⚡',
  support: '🛡️',
  barrier: '🔒',
  occlusive: '💧',
  oil: '✨',
  irritant: '⚠️',
  preservative: '🧪'
};

const potencyLabels = {
  0: 'Mild',
  1: 'Medium',
  2: 'Strong',
  3: 'Very Strong'
};

const potencyColors = {
  0: 'text-emerald-600',
  1: 'text-blue-600',
  2: 'text-amber-600',
  3: 'text-rose-600'
};

// Ingredient descriptions mapping
const ingredientDescriptions = {
  RETINOID: "Vitamin A derivatives that boost cell turnover, reduce fine lines, and improve skin texture. Gold standard for anti-aging.",
  AHA: "Alpha Hydroxy Acids that exfoliate the skin surface, improve texture, and boost radiance. Water-soluble.",
  BHA: "Beta Hydroxy Acid (Salicylic Acid) that penetrates pores to clear congestion. Oil-soluble, ideal for acne-prone skin.",
  PHA: "Polyhydroxy Acids, gentle exfoliants with larger molecules. Less irritating than AHAs, suitable for sensitive skin.",
  NIACINAMIDE: "Vitamin B3 that strengthens barrier, reduces inflammation, controls oil, and brightens skin. Highly versatile.",
  VITC_LAA: "L-Ascorbic Acid, the most potent form of Vitamin C. Brightens, protects against free radicals, boosts collagen.",
  VITC_DERIV: "Vitamin C derivatives that are more stable but less potent than L-AA. Brightening and antioxidant benefits.",
  AZELAIC: "Multi-functional acid that treats acne, rosacea, and hyperpigmentation. Anti-inflammatory and antibacterial.",
  BPO: "Benzoyl Peroxide kills acne bacteria and reduces inflammation. Can be drying and bleach fabrics.",
  PEPTIDE: "Amino acid chains that signal skin to produce collagen, improve firmness, and reduce wrinkles.",
  BARRIER: "Ingredients that repair and strengthen the skin's protective barrier (ceramides, cholesterol, fatty acids).",
  HYDRATOR: "Humectants that draw water into skin (hyaluronic acid, glycerin). Essential for plump, hydrated skin.",
  OCCLUSIVE: "Sealants that prevent water loss (petrolatum, dimethicone). Lock in moisture.",
  FRAGRANCE_EO: "Essential oils and fragrances. Common irritants and allergens, especially for sensitive skin.",
  ALCOHOL_DENAT: "Denatured alcohol that can dry and irritate skin. Often used as a solvent or to create light textures."
};

export default function IngredientDetailModal({ ingredient, onClose, subscriptionTier = 'free', allIngredients = [], familyRules = [] }) {
  if (!ingredient) return null;

  const [expandedSection, setExpandedSection] = useState(null);

  const isProfessional = subscriptionTier === 'professional';
  const isPremium = subscriptionTier === 'premium';

  // Professional: Compatibility matrix from engine rules
  const compatibilityData = React.useMemo(() => {
    const worksWellWith = [];
    const cautionWith = [];
    const avoidWith = [];

    familyRules.forEach(rule => {
      if (rule.family_a === ingredient.family || rule.family_b === ingredient.family) {
        const otherFamily = rule.family_a === ingredient.family ? rule.family_b : rule.family_a;
        
        if (rule.relationship === 'SYNERGY') {
          worksWellWith.push({ family: otherFamily, note: rule.recommended_action || 'Enhances efficacy' });
        } else if (rule.relationship === 'CONDITIONAL') {
          cautionWith.push({ family: otherFamily, note: rule.recommended_action || 'Time separation may be needed' });
        } else if (rule.relationship === 'CONFLICT') {
          avoidWith.push({ family: otherFamily, note: rule.recommended_action || 'Avoid combining' });
        }
      }
    });

    return { worksWellWith, cautionWith, avoidWith };
  }, [ingredient.family, familyRules]);

  // Quick decision data
  const quickDecisionData = {
    RETINOID: { bestFor: 'Aging, texture', poorFit: 'Highly reactive skin', typical: 'PM', adaptation: 'Yes' },
    AHA: { bestFor: 'Dullness, texture', poorFit: 'Impaired barrier', typical: 'PM', adaptation: 'Yes' },
    BHA: { bestFor: 'Acne, congestion', poorFit: 'Dehydrated skin', typical: 'PM', adaptation: 'Moderate' },
    NIACINAMIDE: { bestFor: 'Barrier, oil control', poorFit: 'None', typical: 'AM/PM', adaptation: 'No' },
    VITC_LAA: { bestFor: 'Brightening, antioxidant', poorFit: 'Very sensitive', typical: 'AM', adaptation: 'Moderate' },
    AZELAIC: { bestFor: 'Rosacea, PIH', poorFit: 'None', typical: 'AM/PM', adaptation: 'Moderate' }
  };

  // Concentration context (ranges not percentages)
  const concentrationContext = {
    RETINOID: { cosmetic: 'Low to medium', treatment: 'High', note: 'Efficacy plateaus above certain concentrations—adaptation is rate-limiting' },
    AHA: { cosmetic: 'Low to medium', treatment: 'High', rx: 'Professional peels 30-70%', note: 'Higher concentrations require professional application' },
    BHA: { cosmetic: 'Low to medium', treatment: 'Medium', note: 'OTC max 2%; clinical benefit peaks early' },
    NIACINAMIDE: { cosmetic: 'Medium', treatment: 'Medium to high', note: 'Non-linear efficacy; optimal range 5-10%' },
    VITC_LAA: { cosmetic: 'Medium', treatment: 'Medium to high', note: 'Above 20% provides minimal additional benefit' },
    AZELAIC: { cosmetic: 'Medium', treatment: 'High', rx: 'Rx 15-20%', note: 'Higher concentrations for clinical use' }
  };

  // Formulation constraints
  const formulationData = {
    RETINOID: { 
      ph: '5.5-6.5', 
      solubility: 'Lipophilic', 
      stability: 'Light/air sensitive, degrades rapidly', 
      packaging: 'Opaque airless pump mandatory',
      incompatible: 'High pH environments, strong oxidizers'
    },
    AHA: { 
      ph: '3.0-4.0', 
      solubility: 'Hydrophilic', 
      stability: 'Stable in acidic environment', 
      packaging: 'Standard (opaque preferred)',
      incompatible: 'High pH buffers'
    },
    BHA: { 
      ph: '3.0-4.0', 
      solubility: 'Lipophilic', 
      stability: 'Very stable, oil-soluble', 
      packaging: 'Standard',
      incompatible: 'Alkaline formulas'
    },
    NIACINAMIDE: { 
      ph: '5.0-7.0', 
      solubility: 'Hydrophilic', 
      stability: 'Highly stable across pH', 
      packaging: 'Standard',
      incompatible: 'None (highly compatible)'
    },
    VITC_LAA: { 
      ph: '2.5-3.5', 
      solubility: 'Hydrophilic', 
      stability: 'Extremely unstable—oxidizes on air/light exposure', 
      packaging: 'Dark glass, airless, refrigerated storage',
      incompatible: 'Metals, high pH, oxygen'
    },
    AZELAIC: { 
      ph: '4.0-6.0', 
      solubility: 'Low (suspension formulas)', 
      stability: 'Stable in suspension', 
      packaging: 'Standard',
      incompatible: 'None major'
    }
  };

  // Routine placement logic
  const routinePlacement = {
    RETINOID: { time: 'PM only', startFreq: '2x/week', targetFreq: 'Daily', recovery: 'Mandatory on off-nights', note: 'Photosensitive; buffer with moisturizer for sensitive skin' },
    AHA: { time: 'PM preferred', startFreq: '2-3x/week', targetFreq: 'Daily or alternate', recovery: 'Recommended for high %', note: 'Photosensitizing; always pair with SPF' },
    BHA: { time: 'PM preferred', startFreq: '3x/week', targetFreq: 'Daily', recovery: 'Optional', note: 'Can use AM if well-tolerated' },
    NIACINAMIDE: { time: 'AM or PM', startFreq: 'Daily', targetFreq: 'Daily (1-2x)', recovery: 'Not required', note: 'Stable and non-sensitizing' },
    VITC_LAA: { time: 'AM preferred', startFreq: 'Daily', targetFreq: 'Daily', recovery: 'Not required', note: 'Antioxidant protection; apply before SPF' },
    AZELAIC: { time: 'AM or PM', startFreq: 'Daily', targetFreq: 'Daily (1-2x)', recovery: 'Not required', note: 'Well-tolerated for rosacea' }
  };

  // Comparative rationale
  const comparativeData = {
    RETINOID: {
      advantages: ['Gold-standard anti-aging', 'Deep cell turnover', 'Decades of clinical data'],
      tradeoffs: ['Requires adaptation period', 'Photosensitive', 'Not suitable for pregnancy']
    },
    AHA: {
      advantages: ['Surface exfoliation', 'Immediate glow', 'Accessible'],
      tradeoffs: ['Surface-level only', 'Photosensitizing', 'Can compromise barrier']
    },
    BHA: {
      advantages: ['Lipophilic (pore penetration)', 'Anti-inflammatory', 'Acne-targeted'],
      tradeoffs: ['Can be drying', 'Limited to congestion concerns']
    },
    NIACINAMIDE: {
      advantages: ['Multi-functional', 'Stable and gentle', 'Barrier-supportive'],
      tradeoffs: ['Slower visible results', 'Less dramatic vs actives']
    },
    VITC_LAA: {
      advantages: ['Potent antioxidant', 'Collagen synthesis', 'Brightening'],
      tradeoffs: ['Highly unstable', 'Can oxidize (turn yellow)', 'Acidic (irritating)']
    },
    AZELAIC: {
      advantages: ['Multi-mechanism (acne, rosacea, PIH)', 'Well-tolerated', 'Anti-inflammatory'],
      tradeoffs: ['Texture can be gritty', 'Slower onset than retinoids']
    }
  };

  // Non-professional view
  if (!isProfessional) {
    const description = ingredientDescriptions[ingredient.family] || "A skincare ingredient with various benefits.";
    
    return (
      <AnimatePresence>
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
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{categoryIcons[ingredient.category] || '💊'}</span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{ingredient.name}</h2>
                  {ingredient.inci_name && (
                    <p className="text-sm text-slate-500">INCI: {ingredient.inci_name}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-slate-700 leading-relaxed">{description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium capitalize">
                  {ingredient.category}
                </div>
                <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                  {ingredient.family?.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Potency</span>
                  </div>
                  <p className={cn("text-2xl font-bold", potencyColors[ingredient.potency])}>
                    {potencyLabels[ingredient.potency]}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span className="text-sm font-medium text-rose-600">Irritation Risk</span>
                  </div>
                  <p className={cn("text-2xl font-bold", ingredient.irritation_base < 30 ? "text-emerald-600" : ingredient.irritation_base < 60 ? "text-amber-600" : "text-rose-600")}>
                    {ingredient.irritation_base}%
                  </p>
                </div>
              </div>

              {!isPremium && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 text-center">
                  <Lock className="w-10 h-10 mx-auto mb-3 text-violet-600" />
                  <p className="font-semibold text-violet-900 mb-2">Unlock Professional Details</p>
                  <p className="text-sm text-violet-600 mb-4">
                    Get formulation constraints, compatibility matrix, and routine placement logic
                  </p>
                  <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Professional
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Professional view
  const quickDecision = quickDecisionData[ingredient.family] || {};
  const concentration = concentrationContext[ingredient.family] || {};
  const formulation = formulationData[ingredient.family] || {};
  const placement = routinePlacement[ingredient.family] || {};
  const comparative = comparativeData[ingredient.family] || {};

  return (
    <AnimatePresence>
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* 1. HEADER - Identity & Status */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-5 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-slate-900">{ingredient.name}</h2>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {ingredient.family?.replace(/_/g, ' ')}
                  </span>
                </div>
                {ingredient.inci_name && (
                  <p className="text-sm text-slate-500 mb-3">INCI: {ingredient.inci_name}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Potency:</span>
                    <span className={cn("font-semibold", potencyColors[ingredient.potency])}>
                      {potencyLabels[ingredient.potency]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Irritation:</span>
                    <span className={cn("font-semibold", ingredient.irritation_base < 30 ? "text-emerald-600" : ingredient.irritation_base < 60 ? "text-amber-600" : "text-rose-600")}>
                      {ingredient.irritation_base}%
                    </span>
                  </div>
                  {ingredient.comedogenic_rating !== null && ingredient.comedogenic_rating !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Comedogenic:</span>
                      <span className="font-semibold text-slate-900">{ingredient.comedogenic_rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full flex-shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!isProfessional && (
              <>
                {/* Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-700 leading-relaxed">{description}</p>
                </div>

                {/* Category & Family */}
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium capitalize">
                    {ingredient.category}
                  </div>
                  <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    {ingredient.family?.replace(/_/g, ' ')}
                  </div>
                </div>
              </>
            )}

            {/* Professional: Formulation Constraints */}
            {isProfessional && formulationData[ingredient.family] && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Formulation Constraints
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-800">pH Range:</span>
                    <span className="ml-2 text-indigo-700">{formulationData[ingredient.family].ph}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-800">Stability:</span>
                    <span className="ml-2 text-indigo-700">{formulationData[ingredient.family].stability}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-800">Packaging:</span>
                    <span className="ml-2 text-indigo-700">{formulationData[ingredient.family].packaging}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Professional: Compatibility Matrix */}
            {isProfessional && compatibilityData && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200">
                <h3 className="font-bold text-violet-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Compatibility Matrix
                </h3>
                <div className="space-y-4">
                  {compatibilityData.worksWellWith.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 mb-2">✓ Works Well With</p>
                      <div className="space-y-1">
                        {compatibilityData.worksWellWith.map((item, i) => (
                          <div key={i} className="text-sm text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg">
                            <span className="font-medium">{item.family.replace(/_/g, ' ')}</span>
                            {item.note && <span className="text-xs ml-2">— {item.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {compatibilityData.cautionWith.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-2">⚠ Use Caution With</p>
                      <div className="space-y-1">
                        {compatibilityData.cautionWith.map((item, i) => (
                          <div key={i} className="text-sm text-amber-800 bg-amber-50 px-3 py-2 rounded-lg">
                            <span className="font-medium">{item.family.replace(/_/g, ' ')}</span>
                            {item.note && <span className="text-xs ml-2">— {item.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {compatibilityData.avoidWith.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-rose-700 mb-2">✗ Avoid Combining With</p>
                      <div className="space-y-1">
                        {compatibilityData.avoidWith.map((item, i) => (
                          <div key={i} className="text-sm text-rose-800 bg-rose-50 px-3 py-2 rounded-lg">
                            <span className="font-medium">{item.family.replace(/_/g, ' ')}</span>
                            {item.note && <span className="text-xs ml-2">— {item.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional: Concentration Context */}
            {isProfessional && concentrationContext[ingredient.family] && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200">
                <h3 className="font-bold text-cyan-900 mb-4 flex items-center gap-2">
                  <Droplet className="w-5 h-5" />
                  Concentration Context
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-cyan-800">Cosmetic Range:</span>
                    <span className="text-sm font-mono text-cyan-700 bg-white px-3 py-1 rounded-lg">
                      {concentrationContext[ingredient.family].cosmetic}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-cyan-800">Treatment Range:</span>
                    <span className="text-sm font-mono text-cyan-700 bg-white px-3 py-1 rounded-lg">
                      {concentrationContext[ingredient.family].treatment}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-700 bg-cyan-100 px-3 py-2 rounded-lg mt-2">
                    💡 {concentrationContext[ingredient.family].note}
                  </p>
                </div>
              </div>
            )}

            {/* Professional: Routine Placement Logic */}
            {isProfessional && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Routine Placement Logic
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-amber-800">Best Time:</span>
                    <span className="ml-2 text-amber-700">
                      {['RETINOID', 'AHA', 'BHA', 'AZELAIC'].includes(ingredient.family) ? 'PM (photosensitive)' : 
                       ingredient.family === 'VITC_LAA' ? 'AM (antioxidant protection)' : 'AM or PM'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-800">Frequency Ramp:</span>
                    <span className="ml-2 text-amber-700">
                      {ingredient.potency >= 2 ? '2x/week → Alternate → Daily (over 4-8 weeks)' : 'Start daily if tolerated'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-800">Recovery Pairing:</span>
                    <span className="ml-2 text-amber-700">
                      {ingredient.irritation_base > 50 ? 'Use barrier repair on off-nights' : 'Not required'}
                    </span>
                  </div>
                  {ingredient.family === 'RETINOID' && (
                    <p className="text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                      🌙 Apply after moisturizer (buffering) for sensitive skin, or on bare skin for faster results
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}