import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const familyInfo = {
  RETINOID: {
    label: 'Retinoids',
    emoji: '🔬',
    description: 'Anti-aging powerhouse',
    color: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200'
  },
  AHA: {
    label: 'AHAs',
    emoji: '✨',
    description: 'Surface exfoliation',
    color: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-200'
  },
  BHA: {
    label: 'BHA',
    emoji: '🧪',
    description: 'Pore-clearing acid',
    color: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200'
  },
  PHA: {
    label: 'PHAs',
    emoji: '🌿',
    description: 'Gentle exfoliation',
    color: 'from-teal-50 to-cyan-50',
    borderColor: 'border-teal-200'
  },
  BPO: {
    label: 'Benzoyl Peroxide',
    emoji: '⚡',
    description: 'Acne fighter',
    color: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200'
  },
  NIACINAMIDE: {
    label: 'Niacinamide',
    emoji: '💧',
    description: 'Barrier support',
    color: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200'
  },
  VITC_LAA: {
    label: 'Vitamin C (LAA)',
    emoji: '🍊',
    description: 'Pure brightening',
    color: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200'
  },
  VITC_DERIV: {
    label: 'Vitamin C Derivatives',
    emoji: '🌟',
    description: 'Stable brightening',
    color: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200'
  },
  AZELAIC: {
    label: 'Azelaic Acid',
    emoji: '🌸',
    description: 'Multi-tasking acid',
    color: 'from-indigo-50 to-blue-50',
    borderColor: 'border-indigo-200'
  },
  PEPTIDE: {
    label: 'Peptides',
    emoji: '🔗',
    description: 'Collagen support',
    color: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200'
  },
  BARRIER: {
    label: 'Barrier Repair',
    emoji: '🛡️',
    description: 'Skin protection',
    color: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200'
  },
  HYDRATOR: {
    label: 'Hydrators',
    emoji: '💦',
    description: 'Moisture binding',
    color: 'from-cyan-50 to-blue-50',
    borderColor: 'border-cyan-200'
  },
  OCCLUSIVE: {
    label: 'Occlusives',
    emoji: '🔒',
    description: 'Moisture sealing',
    color: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-200'
  }
};

export default function FamilyCard({ family, activeInstance, onClick, ingredientCount }) {
  const info = familyInfo[family] || {
    label: family,
    emoji: '💊',
    description: 'Skincare active',
    color: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200'
  };

  const isSelected = !!activeInstance;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
        isSelected
          ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20"
          : `border-slate-200 bg-gradient-to-br ${info.color} hover:border-slate-300 hover:shadow-md`
      )}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{info.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight mb-0.5">
              {info.label}
            </h3>
            <p className="text-xs text-slate-500">
              {info.description}
            </p>
          </div>
          <div className={cn(
            "w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center flex-shrink-0",
            isSelected
              ? "border-violet-500 bg-violet-500"
              : "border-slate-300 bg-white group-hover:border-violet-300"
          )}>
            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
        </div>

        {isSelected && activeInstance && (
          <div className="flex flex-col gap-2 text-xs">
            {activeInstance.ingredient_name ? (
              <div className="text-slate-900 font-medium">
                {activeInstance.concentration} {activeInstance.ingredient_name}
              </div>
            ) : (
              <span className="px-2 py-1 rounded-full bg-white/70 capitalize inline-block">{activeInstance.strength}</span>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <span className="px-2 py-1 rounded-full bg-white/70">{activeInstance.frequency === '2x_week' ? '2x/wk' : activeInstance.frequency}</span>
              <span className="px-2 py-1 rounded-full bg-white/70 uppercase">{activeInstance.time_of_day}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}