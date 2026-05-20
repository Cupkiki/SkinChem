import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
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

const irritationColors = [
  'text-emerald-600',
  'text-blue-600',
  'text-amber-600',
  'text-rose-600'
];

export default function IngredientCard({ ingredient, isSelected, onToggle, onShowDetails }) {
  const categoryIcon = categoryIcons[ingredient.category] || '💊';
  const irritationColor = irritationColors[Math.floor(ingredient.irritation_base / 25)] || 'text-slate-400';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group",
        isSelected
          ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      )}
    >
      <div onClick={onToggle} className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm leading-tight mb-0.5 truncate">
              {ingredient.name}
            </h3>
            <p className="text-xs text-slate-500 capitalize truncate">
              {ingredient.family?.replace(/_/g, ' ')}
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

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(ingredient.potency + 1)].map((_, i) => (
                <div key={i} className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  ingredient.potency === 0 ? "bg-emerald-500" :
                  ingredient.potency === 1 ? "bg-blue-500" :
                  ingredient.potency === 2 ? "bg-amber-500" : "bg-rose-500"
                )} />
              ))}
            </div>
            <span className={cn("font-medium", irritationColor)}>
              {ingredient.irritation_base}%
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails?.(ingredient);
        }}
        className="w-full py-1.5 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 font-medium border-t border-slate-200 transition-colors"
      >
        View Details
      </button>
    </motion.div>
  );
}