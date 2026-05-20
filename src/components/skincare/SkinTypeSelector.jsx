import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Sparkles, Layers, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const skinTypes = [
  {
    value: 'normal',
    label: 'Normal',
    icon: Sparkles,
    description: 'Balanced, not too oily or dry',
    color: 'from-green-400 to-emerald-500'
  },
  {
    value: 'dry',
    label: 'Dry',
    icon: Wind,
    description: 'Tight feeling, flaky patches',
    color: 'from-orange-400 to-amber-500'
  },
  {
    value: 'oily',
    label: 'Oily',
    icon: Droplets,
    description: 'Shiny, enlarged pores',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    value: 'combination',
    label: 'Combination',
    icon: Layers,
    description: 'Oily T-zone, dry cheeks',
    color: 'from-violet-400 to-purple-500'
  },
  {
    value: 'sensitive',
    label: 'Sensitive',
    icon: Heart,
    description: 'Easily irritated, reactive',
    color: 'from-rose-400 to-pink-500'
  }
];

export default function SkinTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {skinTypes.map((type) => {
        const Icon = type?.icon || Sparkles;
        const isSelected = value === type?.value;
        
        return (
          <motion.button
            key={type.value}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(type.value)}
            className={cn(
              "relative flex flex-col items-center p-5 rounded-3xl border-2 transition-all duration-300",
              isSelected 
                ? "border-slate-900 bg-slate-900 text-white shadow-xl" 
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
              isSelected 
                ? `bg-gradient-to-br ${type.color}` 
                : "bg-slate-100"
            )}>
              <Icon className={cn("w-7 h-7", isSelected ? "text-white" : "text-slate-500")} />
            </div>
            <span className="font-semibold mb-1">{type.label}</span>
            <span className={cn(
              "text-xs text-center",
              isSelected ? "text-slate-400" : "text-slate-500"
            )}>
              {type.description}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}