'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FoodAnalysis, Nutrient } from '@/lib/types';
import { getNutrientIcon } from '@/lib/constants';
import { useFoodLog } from '@/hooks/use-food-log';
import { useLanguage } from '@/context/language-context';
import { useToast } from './ui/use-toast';

const logFoodSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
});

type LogFoodFormValues = z.infer<typeof logFoodSchema>;

const groupNutrients = (nutrients: Nutrient[]) => {
  const grouped: { macronutrients: Nutrient[]; micronutrients: Nutrient[]; water: Nutrient[] } = {
    macronutrients: [],
    micronutrients: [],
    water: [],
  };

  const MACRONUTRIENT_KEYS = ['protein', 'carbohydrate', 'fat', 'fiber', 'proteina', 'carbohidrato', 'grasa', 'fibra', 'calories', 'energia', 'kcal'];
  const WATER_KEYS = ['water', 'agua'];

  for (const nutrient of nutrients) {
    const nameLower = nutrient.name.toLowerCase();
    if (MACRONUTRIENT_KEYS.some(key => nameLower.includes(key))) {
      grouped.macronutrients.push(nutrient);
    } else if (WATER_KEYS.some(key => nameLower.includes(key))) {
      grouped.water.push(nutrient);
    } else {
      grouped.micronutrients.push(nutrient);
    }
  }

  // Sort macronutrients to have Calories first
  grouped.macronutrients.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName.includes('calories') || aName.includes('energia')) return -1;
    if (bName.includes('calories') || bName.includes('energia')) return 1;
    return 0;
  });

  return grouped;
};


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

  const groupedNutrients = groupNutrients(analysis.nutrients);

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

  const renderNutrientSection = (title: string, nutrients: Nutrient[]) => {
    if (nutrients.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline text-secondary-foreground">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {nutrients.map((nutrient) => {
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
        </div>
    );
  };

  return (
    <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">{analysis.foodItem}</CardTitle>
        <CardDescription>{t('NutritionResultCard.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderNutrientSection(t('NutritionResultCard.macronutrients'), groupedNutrients.macronutrients)}
        {renderNutrientSection(t('NutritionResultCard.micronutrients'), groupedNutrients.micronutrients)}
        {renderNutrientSection(t('NutritionResultCard.water'), groupedNutrients.water)}
      </CardContent>
      <CardFooter>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4 w-full">
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
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {t('NutritionResultCard.logFoodButton')}
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
