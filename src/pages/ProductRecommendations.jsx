import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, ExternalLink, Crown, Sparkles, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProductRecommendations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: ingredients = [] } = useQuery({
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

  const { data: skinProfile } = useQuery({
    queryKey: ['skinProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.SkinProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    }
  });

  // Get product families for each product
  const getProductFamilies = (productId) => {
    const prodIngredients = productIngredients.filter(pi => pi.product_id === productId);
    const families = prodIngredients
      .map(pi => {
        const ing = ingredients.find(i => i.id === pi.ingredient_id);
        return ing?.family;
      })
      .filter(Boolean);
    return [...new Set(families)];
  };

  // Check compatibility score for a product
  const getCompatibilityScore = (product) => {
    if (selectedIngredients.length === 0) return 100;

    const productFamilies = getProductFamilies(product.id);
    let conflictScore = 0;
    let synergies = 0;

    for (const selectedIng of selectedIngredients) {
      const selectedIngData = ingredients.find(i => i.id === selectedIng);
      if (!selectedIngData) continue;

      for (const prodFamily of productFamilies) {
        const rule = familyRules.find(r =>
          (r.family_a === selectedIngData.family && r.family_b === prodFamily) ||
          (r.family_a === prodFamily && r.family_b === selectedIngData.family)
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

  // Sort products by priority logic
  const recommendedProducts = useMemo(() => {
    let filtered = products.filter(p => p.is_approved);

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by product type
    if (productTypeFilter !== 'all') {
      filtered = filtered.filter(p => p.product_type === productTypeFilter);
    }

    // Calculate scores and sort by priority logic
    const scored = filtered.map(product => {
      const compatibilityScore = getCompatibilityScore(product);
      const isSponsored = product.is_sponsored || false;
      
      // Only show sponsored products if they're compatible (score > 60)
      const finalScore = compatibilityScore > 60 && isSponsored
        ? compatibilityScore + 15  // Boost sponsored only if compatible
        : compatibilityScore;

      return {
        ...product,
        compatibilityScore,
        finalScore,
        isCompatible: compatibilityScore > 60
      };
    });

    // Sort: First by compatibility, then by sponsored status within compatible products
    return scored.sort((a, b) => b.finalScore - a.finalScore);
  }, [products, searchQuery, productTypeFilter, selectedIngredients, ingredients, familyRules]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Product Recommendations
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover products that are compatible with your routine and skin type
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or brands..."
                className="pl-12 h-14 rounded-2xl border-2"
              />
            </div>
            <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
              <SelectTrigger className="w-full md:w-48 h-14 rounded-2xl border-2">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cleanser">Cleanser</SelectItem>
                <SelectItem value="toner">Toner</SelectItem>
                <SelectItem value="serum">Serum</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="moisturizer">Moisturizer</SelectItem>
                <SelectItem value="sunscreen">Sunscreen</SelectItem>
                <SelectItem value="mask">Mask</SelectItem>
                <SelectItem value="oil">Oil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative bg-white rounded-3xl border-2 p-6 hover:shadow-lg transition-all",
                product.isCompatible ? "border-emerald-200" : "border-slate-200"
              )}
            >
              {/* Sponsored Badge */}
              {product.is_sponsored && product.isCompatible && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Sponsored
                  </Badge>
                </div>
              )}

              {/* Compatibility Badge */}
              <div className="mb-4">
                {product.isCompatible ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {Math.round(product.compatibilityScore)}% Compatible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    {Math.round(product.compatibilityScore)}% Compatible
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600">{product.brand}</p>
                <Badge variant="outline" className="mt-2 capitalize">
                  {product.product_type}
                </Badge>
              </div>

              {/* Affiliate Link */}
              {product.affiliate_url && (
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className={cn(
                      "w-full rounded-xl",
                      product.isCompatible
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-slate-600 hover:bg-slate-700"
                    )}
                  >
                    View Product
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}

              {!product.affiliate_url && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  disabled
                >
                  Coming Soon
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {recommendedProducts.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}