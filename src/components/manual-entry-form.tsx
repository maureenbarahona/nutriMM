'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { analyzeTextAction } from '@/app/actions';
import { Brain, Sparkles } from 'lucide-react';
import type { FoodAnalysis } from '@/lib/types';
import { NutritionResultCard } from './nutrition-result-card';

const manualEntrySchema = z.object({
  name: z.string().min(2, 'Food name must be at least 2 characters.'),
});

type ManualEntryValues = z.infer<typeof manualEntrySchema>;

export function ManualEntryForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);

  const form = useForm<ManualEntryValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: ManualEntryValues) {
    const foodName = values.name;
    
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
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('ManualEntryForm.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ManualEntryForm.foodNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('ManualEntryForm.foodNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="mr-2 h-4 w-4" />
                  )}
                  {isAnalyzing ? t('ManualEntryForm.analyzingButton') : t('ManualEntryForm.analyzeButton')}
                </Button>
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
