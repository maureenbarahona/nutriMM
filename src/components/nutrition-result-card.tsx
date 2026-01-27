'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FoodAnalysis } from '@/lib/types';
import { getNutrientIcon } from '@/lib/constants';
import { useFoodLog } from '@/hooks/use-food-log';

const logFoodSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
});

type LogFoodFormValues = z.infer<typeof logFoodSchema>;

export function NutritionResultCard({ analysis }: { analysis: FoodAnalysis }) {
  const { addFoodItem } = useFoodLog();
  const t = useTranslations('NutritionResultCard');
  
  const form = useForm<LogFoodFormValues>({
    resolver: zodResolver(logFoodSchema),
    defaultValues: {
      quantity: 100,
    },
  });

  function onSubmit(values: LogFoodFormValues) {
    addFoodItem({
      name: analysis.foodItem,
      quantity: values.quantity,
      nutrients: analysis.nutrients,
    });
  }

  return (
    <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">{analysis.foodItem}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {analysis.nutrients.map((nutrient) => {
            const Icon = getNutrientIcon(nutrient.name);
            return (
              <div key={nutrient.name} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-secondary-foreground">{nutrient.name}</p>
                  <p className="text-lg text-foreground">
                    {nutrient.amount.toLocaleString()} {nutrient.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4 w-full">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>{t('quantityLabel')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {t('logFoodButton')}
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
