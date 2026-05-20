import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Snapshot analysis',
    features: [
      'Unlimited ingredient checks',
      'Compatibility analysis',
      'Risk scoring (one-time)',
      'Static routine suggestions'
    ],
    limitations: [
      'No weekly calendar',
      'No tolerance tracking',
      'No progression system'
    ],
    cta: 'Switch to Free'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    description: 'Full skincare intelligence',
    features: [
      'Everything in Free',
      '7-day routine calendar',
      'Tolerance tracking system',
      'Adaptive progression engine',
      'Goal-based evolution',
      'Weekly auto-adjustments',
      'History & insights'
    ],
    popular: true,
    cta: 'Upgrade to Premium'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29.99,
    period: 'month',
    description: 'For estheticians & formulators',
    features: [
      'Everything in Premium',
      'Client management',
      'Custom formulation tools',
      'White-label reports',
      'API access',
      'Advanced analytics',
      'Dedicated support'
    ],
    cta: 'Go Professional'
  }
];

export default function SubscriptionCard({ currentPlan = 'free', onSelectPlan }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "relative rounded-3xl border-2 p-6 transition-all duration-300",
            plan.popular 
              ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-xl shadow-violet-500/20" 
              : "border-slate-200 bg-white hover:border-slate-300",
            currentPlan === plan.id && "ring-2 ring-slate-900 ring-offset-2"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Most Popular
            </div>
          )}

          <div className="text-center mb-6">
            <div className={cn(
              "inline-flex p-3 rounded-2xl mb-4",
              plan.id === 'free' ? "bg-slate-100" :
              plan.id === 'premium' ? "bg-violet-100" : "bg-amber-100"
            )}>
              {plan.id === 'free' ? <Zap className="w-6 h-6 text-slate-600" /> :
               plan.id === 'premium' ? <Crown className="w-6 h-6 text-violet-600" /> :
               <Sparkles className="w-6 h-6 text-amber-600" />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-slate-900">
                ${plan.price}
              </span>
              <span className="text-slate-500">/{plan.period}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className={cn(
                  "w-5 h-5 mt-0.5",
                  plan.popular ? "text-violet-600" : "text-emerald-600"
                )} />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
            {plan.limitations?.map((limitation, i) => (
              <div key={i} className="flex items-start gap-3 opacity-50">
                <Lock className="w-5 h-5 mt-0.5 text-slate-400" />
                <span className="text-sm text-slate-500 line-through">{limitation}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => onSelectPlan?.(plan.id)}
            disabled={currentPlan === plan.id}
            className={cn(
              "w-full py-6 rounded-2xl font-semibold transition-all duration-300",
              currentPlan === plan.id
                ? "bg-slate-100 text-slate-500"
                : plan.popular 
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30" 
                  : "bg-slate-900 hover:bg-slate-800 text-white"
            )}
          >
            {currentPlan === plan.id ? 'Current Plan' : plan.cta}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}