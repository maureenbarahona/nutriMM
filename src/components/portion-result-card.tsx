'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NutrientTable } from './nutrient-table';
import { useLanguage } from '@/context/language-context';
import { Flame, Scale, Info, Utensils, Database, Sparkles, Hand } from 'lucide-react';
import type { PortionAnalysis } from '@/lib/types';
import { Button } from './ui/button';
import { useFoodLog } from '@/hooks/use-food-log';
import { useToast } from '@/hooks/use-toast';

export function PortionResultCard({ result }: { result: PortionAnalysis }) {
  const { t } = useLanguage();
  const { addFoodItem } = useFoodLog();
  const { toast } = useToast();

  const handleLog = () => {
    addFoodItem({
      name: result.foodItem,
      quantity: result.estimatedWeightGrams,
      nutrients: result.nutrients
    });
    toast({
      title: t('FoodLog.loggedToastTitle'),
      description: t('FoodLog.loggedToastDescription', { quantity: result.estimatedWeightGrams, name: result.foodItem }),
    });
  };

  return (
    <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-500 overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle className="text-3xl font-headline text-primary mb-1">{result.foodItem}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-foreground/70">
              <Utensils className="h-4 w-4" />
              {t('PortionResultCard.absoluteValuesNote')}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-white flex items-center gap-1.5">
              <Database className="h-3 w-3 text-primary" />
              {t('PortionResultCard.compositionTableBadge')}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-white flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              IA NutriM&M
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Flame className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{result.totalCalories.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Kcal</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Scale className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{result.estimatedWeightGrams}g</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('PortionResultCard.estimatedWeight')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Hand Model Section */}
        {result.handPortions && result.handPortions.length > 0 && (
          <div className="bg-secondary/20 p-6 rounded-2xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Hand className="h-5 w-5" />
              <h4 className="font-bold text-lg">{t('NutritionResultCard.handEstimationTitle')}</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.handPortions.map((portion, idx) => (
                <div key={idx} className="bg-white/80 p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t(`PortionTypes.${portion.type}`)}
                  </span>
                  <span className="text-3xl font-black text-primary">x{portion.count}</span>
                  <span className="text-xs italic text-foreground/70 leading-tight">
                    {portion.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 pt-2 text-[10px] text-muted-foreground leading-relaxed">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              <p>{t('NutritionResultCard.handMethodNote')}</p>
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm italic text-foreground/80 leading-relaxed">
            "{result.reasoning}"
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            {t('NutritionResultCard.nutrient')}
          </h4>
          <NutrientTable 
            nutrients={result.nutrients} 
            amountHeader={t('PortionResultCard.amountTotal')}
          />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 border-t p-6">
        <Button onClick={handleLog} className="w-full h-12 text-lg bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
          {t('NutritionResultCard.logFoodButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
