import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Crown, Sparkles, ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProductRecommendations({ selectedIngredients = [] }) {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: ingredientsV2 = [] } = useQuery({
    queryKey: ['ingredientsV2'],
    queryFn: () => base44.entities.IngredientV2.list()
  });

  const { data: productIngredients = [] } = useQuery({
    queryKey: ['productIngredients'],
    queryFn: () => base44.entities.ProductIngredient.list()
  });

  const { data: familyRules = [] } = useQuery({
    queryKey: ['familyRules'],
    queryFn: () => base44.entities.FamilyRule.list()
  });

  const { data: oldIngredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  // Map old ingredient categories to new families
  const categoryToFamilyMap = {
    'retinoid': 'RETINOID',
    'aha': 'AHA',
    'bha': 'BHA',
    'pha': 'PHA',
    'vitamin_c': 'VITC_LAA',
    'vitamin_c_derivative': 'VITC_DERIV',
    'niacinamide': 'NIACINAMIDE',
    'azelaic_acid': 'AZELAIC',
    'peptide': 'PEPTIDE',
    'hyaluronic_acid': 'HYDRATOR',
    'ceramide': 'BARRIER',
    'antioxidant': 'BARRIER'
  };

  const getSelectedFamilies = () => {
    return selectedIngredients
      .map(ingId => {
        const ing = oldIngredients.find(i => i.id === ingId);
        return ing ? categoryToFamilyMap[ing.category] : null;
      })
      .filter(Boolean);
  };

  const getProductFamilies = (productId) => {
    const prodIngredients = productIngredients.filter(pi => pi.product_id === productId);
    const families = prodIngredients
      .map(pi => {
        const ing = ingredientsV2.find(i => i.id === pi.ingredient_id);
        return ing?.family;
      })
      .filter(Boolean);
    return [...new Set(families)];
  };

  const getCompatibilityScore = (product) => {
    if (selectedIngredients.length === 0) return 100;

    const selectedFamilies = getSelectedFamilies();
    const productFamilies = getProductFamilies(product.id);
    
    let conflictScore = 0;
    let synergies = 0;

    for (const selectedFamily of selectedFamilies) {
      for (const prodFamily of productFamilies) {
        const rule = familyRules.find(r =>
          (r.family_a === selectedFamily && r.family_b === prodFamily) ||
          (r.family_a === prodFamily && r.family_b === selectedFamily)
        );

        if (rule) {
          if (rule.relationship === 'CONFLICT') {
            conflictScore += rule.severity || 80;
          } else if (rule.relationship === 'SYNERGY') {
            synergies += 1;
          } else if (rule.relationship === 'CONDITIONAL') {
            conflictScore += (rule.severity || 50) * 0.3;
          }
        }
      }
    }

    return Math.max(0, 100 - conflictScore + (synergies * 10));
  };

  const recommendedProducts = useMemo(() => {
    const approved = products.filter(p => p.is_approved);

    const scored = approved.map(product => {
      const compatibilityScore = getCompatibilityScore(product);
      const isSponsored = product.is_sponsored || false;
      
      const finalScore = compatibilityScore > 60 && isSponsored
        ? compatibilityScore + 15
        : compatibilityScore;

      return {
        ...product,
        compatibilityScore,
        finalScore,
        isCompatible: compatibilityScore > 60
      };
    });

    return scored
      .filter(p => p.isCompatible)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 6);
  }, [products, selectedIngredients]);

  if (selectedIngredients.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-100">
            <ShoppingBag className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recommended Products</h2>
            <p className="text-sm text-slate-600">Compatible with your selected ingredients</p>
          </div>
        </div>
      </div>

      {recommendedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-200">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">No compatible products found for your selection</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white rounded-3xl border-2 border-emerald-200 p-6 hover:shadow-lg transition-all"
            >
              {product.is_sponsored && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Sponsored
                  </Badge>
                </div>
              )}

              <div className="mb-4">
                <Badge className="bg-emerald-100 text-emerald-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {Math.round(product.compatibilityScore)}% Match
                </Badge>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600">{product.brand}</p>
                <Badge variant="outline" className="mt-2 capitalize">
                  {product.product_type}
                </Badge>
              </div>

              {product.affiliate_url ? (
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    View Product
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              ) : (
                <Button variant="outline" className="w-full rounded-xl" disabled>
                  Coming Soon
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}