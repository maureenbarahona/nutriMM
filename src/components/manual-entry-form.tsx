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
import { useState, useEffect } from 'react';
import { analyzeTextAction } from '@/app/actions';
import { Brain, Sparkles, Database } from 'lucide-react';
import type { FoodAnalysis } from '@/lib/types';
import { NutritionResultCard } from './nutrition-result-card';
import { useAnalysisCache } from '@/hooks/use-analysis-cache';

const manualEntrySchema = z.object({
  name: z.string().min(2, 'Food name must be at least 2 characters.'),
});

type ManualEntryValues = z.infer<typeof manualEntrySchema>;

export function ManualEntryForm() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const { getFromCache, saveToCache } = useAnalysisCache();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const form = useForm<ManualEntryValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: ManualEntryValues) {
    const foodName = values.name.trim();
    
    // 1. Intentar obtener de la caché local
    const cached = getFromCache(foodName);
    if (cached) {
      setAnalysisResult(cached);
      toast({
        title: locale === 'es' ? "Datos recuperados" : "Data retrieved",
        description: locale === 'es' 
          ? `Usando información guardada localmente para: ${foodName}` 
          : `Using locally saved information for: ${foodName}`,
      });
      return;
    }

    // 2. Si no está en caché, analizar con IA
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeTextAction(foodName, location, locale);
    setIsAnalyzing(false);

    if (result.status === 'error') {
      toast({
        variant: 'destructive',
        title: t('ScanForm.analysisFailedTitle'),
        description: t(result.message, result.messageValues),
      });
    } else if (result.data) {
        setAnalysisResult(result.data);
        // 3. Guardar en caché para futuras consultas
        saveToCache(foodName, result.data);
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
            {analysisResult.isFromCache && (
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-primary/20 animate-pulse">
                  <Database className="h-3 w-3" />
                  {locale === 'es' ? 'RESULTADO CARGADO DESDE CACHÉ LOCAL' : 'RESULT LOADED FROM LOCAL CACHE'}
                </div>
              </div>
            )}
            <NutritionResultCard analysis={analysisResult} />
        </div>
      )}
    </>
  );
}
