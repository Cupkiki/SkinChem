import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Crown, CheckCircle2, ArrowLeft, Sparkles, Shield, 
  Zap, Clock, Users, BarChart3, FileText, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import SubscriptionCard from '@/components/skincare/SubscriptionCard';
import { toast } from 'sonner';

const features = [
  {
    icon: Sparkles,
    title: 'Unlimited Analysis',
    description: 'Check unlimited ingredient combinations without restrictions'
  },
  {
    icon: Shield,
    title: 'Barrier Monitoring',
    description: 'Track your skin barrier health over time with smart insights'
  },
  {
    icon: Clock,
    title: 'Smart Routines',
    description: 'Get optimized AM/PM routines based on your ingredients'
  },
  {
    icon: Users,
    title: 'Skin Type Match',
    description: 'Personalized recommendations for your specific skin type'
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor how your routine affects your skin over weeks'
  },
  {
    icon: FileText,
    title: 'Detailed Reports',
    description: 'Export comprehensive compatibility reports'
  }
];

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Absolutely. We use industry-standard encryption and never store your full payment details on our servers.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your saved routines and preferences remain accessible. You can always resubscribe to access premium features again.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 7-day money-back guarantee if you\'re not satisfied with Premium features.'
  }
];

export default function Subscription() {
  const queryClient = useQueryClient();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    }
  });

  const updateSubscription = useMutation({
    mutationFn: async (tier) => {
      const user = await base44.auth.me();
      
      if (userProfile) {
        await base44.entities.UserProfile.update(userProfile.id, {
          subscription_tier: tier,
          subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else {
        await base44.entities.UserProfile.create({
          user_email: user.email,
          subscription_tier: tier,
          subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Subscription updated successfully!');
    }
  });

  const currentPlan = userProfile?.subscription_tier || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link 
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            Premium Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Unlock Your Full
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"> Skincare Potential</span>
          </h1>
          <p className="text-lg text-slate-600">
            Choose the plan that fits your skincare journey. 
            From casual enthusiasts to professional formulators.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <SubscriptionCard 
          currentPlan={currentPlan}
          onSelectPlan={(plan) => updateSubscription.mutate(plan)}
        />

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-24"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Everything You Get with Premium
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-violet-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    className="text-slate-400"
                  >
                    ▼
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFaq === index ? 'auto' : 0,
                    opacity: expandedFaq === index ? 1 : 0
                  }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-slate-600">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 mb-12 p-8 rounded-3xl bg-slate-900 text-white text-center"
        >
          <Headphones className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Need Help Choosing?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Our skincare experts are here to help you find the perfect plan for your routine.
          </p>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-slate-900 rounded-2xl px-8"
          >
            Contact Support
          </Button>
        </motion.div>
      </div>
    </div>
  );
}