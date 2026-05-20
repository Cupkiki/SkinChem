import React, { useState, useMemo } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Beaker, CheckCircle2, AlertTriangle, XCircle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allIngredients = [], isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: compatibilityRules = [] } = useQuery({
    queryKey: ['compatibilityRules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compatibility_rules')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredIngredients = useMemo(() => {
    return allIngredients.filter(ing => 
      !searchQuery || 
      ing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.family?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allIngredients, searchQuery]);

  const checkCompatibility = (ing1Name, ing2Name) => {
    const rule = compatibilityRules.find(r => 
      (r.ingredient_1_name === ing1Name && r.ingredient_2_name === ing2Name) ||
      (r.ingredient_1_name === ing2Name && r.ingredient_2_name === ing1Name)
    );
    return rule;
  };

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev => {
      const exists = prev.find(i => i.id === ingredient.id);
      if (exists) {
        return prev.filter(i => i.id !== ingredient.id);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const calculateRiskScores = () => {
    if (selectedIngredients.length === 0) return null;

    let totalIrritation = 0;
    let totalBarrierStress = 0;
    let conflicts = 0;
    let synergies = 0;

    selectedIngredients.forEach(ing => {
      totalIrritation += ing.irritation_weight || 0;
      totalBarrierStress += ing.barrier_stress_weight || 0;
    });

    const pairs = [];
    for (let i = 0; i < selectedIngredients.length; i++) {
      for (let j = i + 1; j < selectedIngredients.length; j++) {
        const rule = checkCompatibility(
          selectedIngredients[i].name,
          selectedIngredients[j].name
        );
        if (rule) {
          pairs.push({
            ing1: selectedIngredients[i].name,
            ing2: selectedIngredients[j].name,
            rule
          });

          totalIrritation += rule.irritation_risk || 0;
          totalBarrierStress += rule.barrier_stress_impact || 0;

          if (rule.relationship_type === 'conflict') conflicts++;
          if (rule.relationship_type === 'synergy') synergies++;
        }
      }
    }

    const irritationScore = Math.min(100, Math.max(0, totalIrritation * 5));
    const barrierScore = Math.min(100, Math.max(0, totalBarrierStress * 5));

    return { pairs, irritationScore, barrierScore, conflicts, synergies };
  };

  const riskData = calculateRiskScores();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              SkinChem Analyzer v2.0
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            ✨ CLICK INGREDIENTS TO SELECT ✨
          </p>
          <p className="text-gray-500 text-sm">
            {allIngredients.length} ingredients available
          </p>
        </div>

        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg rounded-xl border-2 focus:border-violet-500 shadow-sm"
            />
          </div>
        </div>

        {riskData && selectedIngredients.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-violet-100 max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600">{selectedIngredients.length}</div>
                <div className="text-sm text-gray-600 mt-1">Selected</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className={`text-4xl font-bold ${
                  riskData.irritationScore > 60 ? 'text-red-600' :
                  riskData.irritationScore > 30 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {Math.round(riskData.irritationScore)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Irritation</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className={`text-4xl font-bold ${
                  riskData.barrierScore > 60 ? 'text-red-600' :
                  riskData.barrierScore > 30 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {Math.round(Math.abs(riskData.barrierScore))}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Barrier Impact</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map(ing => (
                  <span
                    key={ing.id}
                    className="px-3 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {ing.name}
                    <button onClick={() => toggleIngredient(ing)}>
                      <XCircle className="w-4 h-4 hover:text-violet-900" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {riskData.pairs.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-violet-600" />
                  Compatibility Analysis
                </h4>
                {riskData.pairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      pair.rule.relationship_type === 'synergy' ? 'bg-green-50 border-green-300' :
                      pair.rule.relationship_type === 'conflict' ? 'bg-red-50 border-red-300' :
                      'bg-yellow-50 border-yellow-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      {pair.rule.relationship_type === 'synergy' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : pair.rule.relationship_type === 'conflict' ? (
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      ) : (
                        <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">{pair.rule.warning_message}</p>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {pair.ing1} + {pair.ing2}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">{pair.rule.explanation}</p>
                        <div className="bg-white/70 p-3 rounded-lg">
                          <p className="text-sm font-medium">💡 {pair.rule.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map(ingredient => {
            const isSelected = selectedIngredients.find(i => i.id === ingredient.id);
            
            return (
              <div
                key={ingredient.id}
                onClick={() => toggleIngredient(ingredient)}
                className={`p-5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-100 border-2 border-violet-500 shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-violet-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{ingredient.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {ingredient.family}
                      </span>
                      {ingredient.am_pm_preference && ingredient.am_pm_preference !== 'BOTH' && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {ingredient.am_pm_preference}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-7 h-7 text-violet-600 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {ingredient.description}
                </p>

                {ingredient.benefits && ingredient.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ingredient.benefits.slice(0, 3).map((benefit, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
