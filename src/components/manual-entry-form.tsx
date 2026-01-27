'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next-intl/client';
import { z } from 'zod';
import { useFoodLog } from '@/hooks/use-food-log';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ManualEntryForm');

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

  function onSubmit(values: ManualEntryValues) {
    addFoodItem({
      name: values.name,
      quantity: values.quantity,
      nutrients: [
        { name: 'Calories', amount: values.calories, unit: 'kcal' },
        { name: 'Protein', amount: values.protein, unit: 'g' },
        { name: 'Carbohydrates', amount: values.carbs, unit: 'g' },
        { name: 'Fat', amount: values.fat, unit: 'g' },
      ],
    });
    router.push('/history');
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
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
                    <FormLabel>{t('foodNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('foodNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quantityLabel')}</FormLabel>
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
                    <FormLabel>{t('caloriesLabel')}</FormLabel>
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
                    <FormLabel>{t('proteinLabel')}</FormLabel>
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
                    <FormLabel>{t('carbsLabel')}</FormLabel>
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
                    <FormLabel>{t('fatLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full md:w-auto">{t('addToHistoryButton')}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
