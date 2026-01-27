'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useFoodLog } from '@/hooks/use-food-log';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { useToast } from './ui/use-toast';
import { useState } from 'react';
import { analyzeTextAction } from '@/app/actions';
import { Brain, Sparkles } from 'lucide-react';
import type { FoodAnalysis, Nutrient } from '@/lib/types';
import { NutritionResultCard } from './nutrition-result-card';

const manualEntrySchema = z.object({
  name: z.string().min(2, 'Food name must be at least 2 characters.'),
  quantity: z.coerce.number().min(1, 'Quantity is required.'),
  calories: z.coerce.number().min(0, 'Calories cannot be negative.'),
  protein: z.coerce.number().min(0, 'Protein cannot be negative.'),
  carbs: z.coerce.number().min(0, 'Carbs cannot be negative.'),
  fat: z.coerce.number().min(0, 'Fat cannot be negative.'),
});

type ManualEntryValues = z.infer<typeof manualEntrySchema>;

export function ManualEntryForm() {
  const router = useRouter();
  const { addFoodItem } = useFoodLog();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);

  const form = useForm<ManualEntryValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      name: '',
      quantity: 100,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  const handleAnalyze = async () => {
    const foodName = form.getValues('name');
    if (!foodName) {
      toast({
        variant: 'destructive',
        title: t('ScanForm.errorTitle'),
        description: t('Actions.foodNameRequired'),
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeTextAction(foodName);
    setIsAnalyzing(false);

    if (result.status === 'error') {
      toast({
        variant: 'destructive',
        title: t('ScanForm.analysisFailedTitle'),
        description: t(result.message, result.messageValues),
      });
    } else if (result.data) {
        setAnalysisResult(result.data);
        toast({
            title: t('ScanForm.analysisSuccessTitle'),
            description: t(result.message, result.messageValues),
        });
      
      result.data.nutrients.forEach((nutrient: Nutrient) => {
        const nameLower = nutrient.name.toLowerCase();
        if (nameLower.includes('calories') || nameLower.includes('energia') || nameLower.includes('kcal')) {
            form.setValue('calories', Math.round(nutrient.amount));
        } else if (nameLower.includes('protein') || nameLower.includes('proteína')) {
            form.setValue('protein', nutrient.amount);
        } else if (nameLower.includes('carbohydrate') || nameLower.includes('carbohidrato')) {
            form.setValue('carbs', nutrient.amount);
        } else if (nameLower.includes('fat') || nameLower.includes('grasa')) {
            form.setValue('fat', nutrient.amount);
        }
      });
    }
  };

  function onSubmit(values: ManualEntryValues) {
    const nutrientsToLog = analysisResult?.nutrients && analysisResult.nutrients.length > 0
      ? analysisResult.nutrients
      : [
        { name: 'Calories', amount: values.calories, unit: 'kcal' },
        { name: 'Protein', amount: values.protein, unit: 'g' },
        { name: 'Carbohydrates', amount: values.carbs, unit: 'g' },
        { name: 'Fat', amount: values.fat, unit: 'g' },
      ];
    
    const item = {
      name: values.name,
      quantity: values.quantity,
      nutrients: nutrientsToLog,
    };
    
    addFoodItem(item);
    toast({
        title: t('FoodLog.loggedToastTitle'),
        description: t('FoodLog.loggedToastDescription', { quantity: item.quantity, name: item.name }),
    });
    router.push('/history');
  }

  return (
    <>
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('ManualEntryForm.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('ManualEntryForm.foodNameLabel')}</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder={t('ManualEntryForm.foodNamePlaceholder')} {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        {isAnalyzing ? t('ManualEntryForm.analyzingButton') : t('ManualEntryForm.analyzeButton')}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ManualEntryForm.quantityLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ManualEntryForm.caloriesLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="52" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ManualEntryForm.proteinLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ManualEntryForm.carbsLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="13.8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ManualEntryForm.fatLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full md:w-auto">{t('ManualEntryForm.addToHistoryButton')}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>

    {analysisResult && (
        <div className="max-w-2xl mx-auto mt-8">
            <NutritionResultCard analysis={analysisResult} />
        </div>
    )}
    </>
  );
}
