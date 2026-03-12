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
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">{analysis.foodItem}</CardTitle>
              <CardDescription>{t('NutritionResultCard.description')}</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              INCAP Database
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
