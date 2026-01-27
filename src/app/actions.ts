'use server';

import { analyzeFoodImageAndDisplayNutrition } from '@/ai/flows/analyze-food-image-and-display-nutrition';
import { summarizeDailyNutrientIntake } from "@/ai/flows/summarize-daily-nutrient-intake";
import { parseNutritionString } from '@/lib/utils';
import type { FoodLogItem, Nutrient } from '@/lib/types';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

export type AnalysisState = {
  status: 'error' | 'success';
  message: string;
  data?: {
    foodItem: string;
    nutrients: Nutrient[];
  };
};

const analyzeImageSchema = z.object({
  image: z.string().refine((val) => val.startsWith('data:image/'), {
    message: 'Image must be a data URI',
  }),
});

export async function analyzeImageAction(
  prevState: any,
  formData: FormData
): Promise<AnalysisState> {
  const t = await getTranslations('Actions');
  try {
    const validated = analyzeImageSchema.safeParse({
      image: formData.get('image'),
    });

    if (!validated.success) {
      return { status: 'error', message: t('imageRequired') };
    }

    const result = await analyzeFoodImageAndDisplayNutrition({
      photoDataUri: validated.data.image,
    });

    if (!result.foodItem || !result.nutritionalInformation) {
      return {
        status: 'error',
        message: t('analysisError'),
      };
    }

    const nutrients = parseNutritionString(result.nutritionalInformation);

    if (nutrients.length === 0) {
      return {
        status: 'error',
        message: t('extractionError', { foodItem: result.foodItem }),
      };
    }

    const t_scan = await getTranslations('ScanForm');

    return {
      status: 'success',
      message: t_scan('analysisSuccessTitle'),
      data: {
        foodItem: result.foodItem,
        nutrients,
      },
    };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: t('unexpectedError') };
  }
}

export async function getDailySummaryAction(foodItems: FoodLogItem[]) {
    const t = await getTranslations('Actions');
    if (!foodItems || foodItems.length === 0) {
        return { error: t('noFoodItems') };
    }

    // A simple set of recommended daily values. In a real app, this would be user-specific.
    const recommendedDailyValues = {
        'Calories': 2000,
        'Protein': 50,
        'Carbohydrates': 275,
        'Fat': 78,
        'Fiber': 28,
    };
    
    // Transform FoodLogItem nutrients into the format required by the AI flow
    const flowInputItems = foodItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        nutritionalInfo: item.nutrients.reduce((acc, nutrient) => {
            // Find a matching key in recommended values to normalize names (e.g., "Energia (kcal)" -> "Calories")
            const recommendedKey = Object.keys(recommendedDailyValues).find(key => nutrient.name.toLowerCase().includes(key.toLowerCase()));
            const key = recommendedKey || nutrient.name;
            acc[key] = nutrient.amount;
            return acc;
        }, {} as Record<string, number>),
    }));

    try {
        const summary = await summarizeDailyNutrientIntake({
            foodItems: flowInputItems,
            recommendedDailyValues,
        });
        return { data: summary.summary };
    } catch(error) {
        console.error("Daily summary error:", error);
        return { error: t('summaryError') };
    }
}
