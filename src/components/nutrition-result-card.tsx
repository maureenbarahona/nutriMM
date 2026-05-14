'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FoodAnalysis } from '@/lib/types';
import { useFoodLog } from '@/hooks/use-food-log';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { NutrientTable } from './nutrient-table';
import { Badge } from './ui/badge';
import { Activity, Info, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const logFoodSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
});

type LogFoodFormValues = z.infer<typeof logFoodSchema>;

export function NutritionResultCard({ analysis }: { analysis: FoodAnalysis }) {
  const { addFoodItem } = useFoodLog();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const form = useForm<LogFoodFormValues>({
    resolver: zodResolver(logFoodSchema),
    defaultValues: {
      quantity: 100,
    },
  });

  function onSubmit(values: LogFoodFormValues) {
    const item = {
      name: analysis.foodItem,
      quantity: values.quantity,
      nutrients: analysis.nutrients,
    };
    addFoodItem(item);
    toast({
        title: t('FoodLog.loggedToastTitle'),
        description: t('FoodLog.loggedToastDescription', { quantity: item.quantity, name: item.name }),
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-primary/5">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">{analysis.foodItem}</CardTitle>
              <CardDescription>{t('NutritionResultCard.description')}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-white flex items-center gap-1.5 h-auto">
                    <Database className="h-3 w-3 text-primary shrink-0" />
                    <span>{analysis.dataSource || "INCAP Database"}</span>
                </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          {/* Traffic Light Semáforo for GI */}
          {analysis.glycemicIndex && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-lg text-primary/80 uppercase tracking-wider">
                   {t('PortionResultCard.gi_title')}
                </h4>
              </div>
              
              <Card className={cn(
                  "overflow-hidden border-2 transition-all shadow-sm rounded-3xl",
                  analysis.glycemicIndex.category === 'low' ? "bg-green-50/30 border-green-200" :
                  analysis.glycemicIndex.category === 'medium' ? "bg-yellow-50/30 border-yellow-200" : "bg-red-50/30 border-red-200"
              )}>
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                      {/* Visual Traffic Light (Semáforo) */}
                      <div className="bg-neutral-900 p-3 rounded-2xl shadow-xl flex md:flex-col gap-3 shrink-0">
                          <div className={cn(
                              "w-10 h-10 rounded-full border-2 border-white/10 transition-all duration-500",
                              analysis.glycemicIndex.category === 'high' ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-red-950/30"
                          )} />
                          <div className={cn(
                              "w-10 h-10 rounded-full border-2 border-white/10 transition-all duration-500",
                              analysis.glycemicIndex.category === 'medium' ? "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]" : "bg-yellow-950/30"
                          )} />
                          <div className={cn(
                              "w-10 h-10 rounded-full border-2 border-white/10 transition-all duration-500",
                              analysis.glycemicIndex.category === 'low' ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]" : "bg-green-950/30"
                          )} />
                      </div>

                      <div className="space-y-3 text-center md:text-left flex-1">
                          <div className="flex items-baseline gap-3 justify-center md:justify-start">
                              <span className="text-5xl font-black text-foreground">
                                  {analysis.glycemicIndex.value.toFixed(0)}
                              </span>
                              <Badge className={cn(
                                  "text-white font-bold px-4 py-1 text-sm uppercase rounded-lg",
                                  analysis.glycemicIndex.category === 'low' ? "bg-green-600" :
                                  analysis.glycemicIndex.category === 'medium' ? "bg-yellow-600" : "bg-red-600"
                              )}>
                                  {t(`PortionResultCard.gi_${analysis.glycemicIndex.category}`)}
                              </Badge>
                          </div>
                          <p className="text-base text-foreground/80 leading-relaxed font-medium italic">
                              "{analysis.glycemicIndex.description}"
                          </p>
                          <div className="flex items-center gap-2 justify-center md:justify-start text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                              <Info className="h-3 w-3" />
                              {t('PortionResultCard.gi_source_note')}
                          </div>
                      </div>
                  </CardContent>
              </Card>
            </div>
          )}

          <NutrientTable nutrients={analysis.nutrients} />
        </CardContent>
        <CardFooter className="bg-muted/30 pt-6">
          <Form {...form}>
            <div className="flex items-end gap-4 w-full">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>{t('NutritionResultCard.quantityLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button onClick={form.handleSubmit(onSubmit)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                {t('NutritionResultCard.logFoodButton')}
              </Button>
            </div>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
