import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Flame, ShieldAlert, Droplet, Sun, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const conditions = [
  { 
    value: 'acne_prone', 
    label: 'Acne-Prone', 
    icon: AlertCircle,
    description: 'Frequent breakouts and clogged pores',
    color: 'from-red-500 to-rose-600'
  },
  { 
    value: 'rosacea', 
    label: 'Rosacea', 
    icon: Flame,
    description: 'Redness and visible blood vessels',
    color: 'from-rose-500 to-pink-600'
  },
  { 
    value: 'barrier_damaged', 
    label: 'Barrier Damaged', 
    icon: ShieldAlert,
    description: 'Compromised skin barrier, easily irritated',
    color: 'from-amber-500 to-orange-600'
  },
  { 
    value: 'dehydrated', 
    label: 'Dehydrated', 
    icon: Droplet,
    description: 'Lacks moisture, feels tight',
    color: 'from-blue-500 to-cyan-600'
  },
  { 
    value: 'sun_damaged', 
    label: 'Sun Damaged', 
    icon: Sun,
    description: 'Hyperpigmentation and premature aging',
    color: 'from-yellow-500 to-amber-600'
  },
  { 
    value: 'aging', 
    label: 'Aging Concerns', 
    icon: Clock,
    description: 'Fine lines, wrinkles, loss of firmness',
    color: 'from-purple-500 to-violet-600'
  }
];

export default function SkinConditionSelector({ value = [], onChange }) {
  const toggleCondition = (conditionValue) => {
    if (value.includes(conditionValue)) {
      onChange(value.filter(v => v !== conditionValue));
    } else {
      onChange([...value, conditionValue]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {conditions.map((condition) => {
        const Icon = condition?.icon || AlertCircle;
        const isSelected = value.includes(condition?.value);
        
        return (
          <motion.button
            key={condition.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleCondition(condition.value)}
            className={cn(
              "p-4 rounded-2xl border-2 text-left transition-all duration-300",
              isSelected
                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                : "bg-white border-slate-200 hover:border-slate-300"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl mb-3 flex items-center justify-center",
              isSelected 
                ? "bg-white/20" 
                : `bg-gradient-to-br ${condition.color} bg-opacity-10`
            )}>
              <Icon className={cn(
                "w-5 h-5",
                isSelected ? "text-white" : "text-slate-700"
              )} />
            </div>
            <p className={cn(
              "font-semibold mb-1",
              isSelected ? "text-white" : "text-slate-900"
            )}>
              {condition.label}
            </p>
            <p className={cn(
              "text-xs",
              isSelected ? "text-slate-300" : "text-slate-500"
            )}>
              {condition.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}