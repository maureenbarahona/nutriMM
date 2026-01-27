'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  const grouped: {
    macronutrients: Nutrient[];
    minerals: Nutrient[];
    vitamins: Nutrient[];
    water: Nutrient[];
  } = {
    macronutrients: [],
    minerals: [],
    vitamins: [],
    water: [],
  };

  const MACRONUTRIENT_KEYS = ['protein', 'carbohydrate', 'fat', 'fiber', 'proteina', 'carbohidrato', 'grasa', 'fibra', 'calories', 'energia', 'kcal'];
  const WATER_KEYS = ['water', 'agua'];
  const VITAMIN_KEYS = ['vitamin', 'vitamina'];
  const MINERAL_KEYS = [
    'calcium', 'iron', 'potassium', 'sodium', 'magnesium', 'zinc', 'phosphorus', 'manganese', 'copper', 'selenium', 'iodine',
    'calcio', 'hierro', 'potasio', 'sodio', 'magnesio', 'fosforo', 'manganeso', 'cobre', 'selenio', 'yodo'
  ];

  const others: Nutrient[] = [];

  for (const nutrient of nutrients) {
    const nameLower = nutrient.name.toLowerCase();
    if (MACRONUTRIENT_KEYS.some(key => nameLower.includes(key))) {
      grouped.macronutrients.push(nutrient);
    } else if (WATER_KEYS.some(key => nameLower.includes(key))) {
      grouped.water.push(nutrient);
    } else if (VITAMIN_KEYS.some(key => nameLower.includes(key))) {
      grouped.vitamins.push(nutrient);
    } else if (MINERAL_KEYS.some(key => nameLower.includes(key))) {
      grouped.minerals.push(nutrient);
    } else {
      others.push(nutrient); // Collect others for fallback
    }
  }

  // Fallback for unidentified nutrients, often they are minerals or other micronutrients
  if (others.length > 0) {
    grouped.minerals.push(...others);
  }

  // Sort macronutrients to have Calories first
  grouped.macronutrients.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName.includes('calories') || aName.includes('energia')) return -1;
    if (bName.includes('calories') || bName.includes('energia')) return 1;
    if (aName.includes('protein') || aName.includes('proteina')) return -1;
    if (bName.includes('protein') || bName.includes('proteina')) return 1;
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

  const renderNutrientRow = (nutrient: Nutrient) => {
    const Icon = getNutrientIcon(nutrient.name);
    return (
        <TableRow key={nutrient.name}>
            <TableCell className="font-medium flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{nutrient.name}</span>
            </TableCell>
            <TableCell className="text-right">
                {nutrient.amount.toLocaleString()} {nutrient.unit}
            </TableCell>
        </TableRow>
    );
  };

  const renderGroupHeader = (title: string) => (
      <TableRow className="bg-secondary hover:bg-secondary">
          <TableCell colSpan={2} className="font-semibold text-secondary-foreground">{title}</TableCell>
      </TableRow>
  );

  return (
    <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">{analysis.foodItem}</CardTitle>
        <CardDescription>{t('NutritionResultCard.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('NutritionResultCard.nutrient')}</TableHead>
                        <TableHead className="text-right">{t('NutritionResultCard.amountPer100g')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedNutrients.macronutrients.length > 0 && renderGroupHeader(t('NutritionResultCard.macronutrients'))}
                    {groupedNutrients.macronutrients.map(renderNutrientRow)}
                    
                    {groupedNutrients.vitamins.length > 0 && renderGroupHeader(t('NutritionResultCard.vitamins'))}
                    {groupedNutrients.vitamins.map(renderNutrientRow)}

                    {groupedNutrients.minerals.length > 0 && renderGroupHeader(t('NutritionResultCard.minerals'))}
                    {groupedNutrients.minerals.map(renderNutrientRow)}

                    {groupedNutrients.water.length > 0 && renderGroupHeader(t('NutritionResultCard.water'))}
                    {groupedNutrients.water.map(renderNutrientRow)}
                </TableBody>
            </Table>
        </Card>
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
