'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NutrientTable } from './nutrient-table';
import { useLanguage } from '@/context/language-context';
import { Flame, Scale, Info, Utensils } from 'lucide-react';
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-headline text-primary mb-1">{result.foodItem}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-foreground/70">
              <Utensils className="h-4 w-4" />
              {t('PortionResultCard.absoluteValuesNote')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-white">
            Nutrition5k Method
          </Badge>
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
          <NutrientTable nutrients={result.nutrients} />
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
