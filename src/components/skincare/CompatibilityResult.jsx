import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const interactionStyles = {
  synergistic: {
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    icon: Sparkles,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: '➕ Synergy',
    subtitle: 'These work better together'
  },
  conditional: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: '⚠️ Caution / Conditional',
    subtitle: 'Safe with spacing or skin type consideration'
  },
  redundant: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    icon: CheckCircle2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: '✅ Good Combination',
    subtitle: 'Compatible and safe to use together'
  },
  conflict: {
    bg: 'bg-gradient-to-br from-rose-50 to-red-50',
    border: 'border-rose-200',
    icon: XCircle,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    title: '❌ Avoid',
    subtitle: 'Irritation, pH clash, or barrier damage'
  }
};

export default function CompatibilityResult({ interaction, ingredientA, ingredientB }) {
  const style = interactionStyles[interaction?.interaction_type] || interactionStyles.redundant;
  const Icon = style?.icon || CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "rounded-3xl border-2 p-6 transition-all duration-300",
        style.bg, style.border
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-2xl", style.iconBg)}>
          <Icon className={cn("w-6 h-6", style.iconColor)} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-slate-900">{ingredientA}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{ingredientB}</span>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-1">{style.title}</h3>
          <p className="text-sm text-slate-500 mb-4">{style.subtitle}</p>
          
          <p className="text-slate-700 mb-4">{interaction.explanation}</p>
          
          {interaction.recommendation && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-white">
              <Zap className="w-5 h-5 text-violet-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Recommendation</p>
                <p className="text-sm text-slate-600">{interaction.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}