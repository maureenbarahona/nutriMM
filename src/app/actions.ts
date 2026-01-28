'use server';

import { analyzeFoodImageAndDisplayNutrition } from '@/ai/flows/analyze-food-image-and-display-nutrition';
import { analyzeFoodTextAndDisplayNutrition } from '@/ai/flows/analyze-food-text-and-display-nutrition';
import { summarizeDailyNutrientIntake } from "@/ai/flows/summarize-daily-nutrient-intake";
import { parseNutritionString } from '@/lib/utils';
import type { FoodLogItem, Nutrient } from '@/lib/types';
import { z } from 'zod';

export type AnalysisState = {
  status: 'error' | 'success';
  message: string;
  messageValues?: Record<string, string | number>;
  data?: {
    foodItem: string;
    nutrients: Nutrient[];
  };
};

const analyzeImageSchema = z.object({
  image: z.string().refine((val) => val.startsWith('data:image/'), {
    message: 'Image must be a data URI',
  }),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export async function analyzeImageAction(
  prevState: any,
  formData: FormData
): Promise<AnalysisState> {
  try {
    const validated = analyzeImageSchema.safeParse({
      image: formData.get('image'),
      latitude: formData.get('latitude'),
      longitude: formData.get('longitude'),
    });

    if (!validated.success) {
      return { status: 'error', message: "Actions.imageRequired" };
    }

    const result = await analyzeFoodImageAndDisplayNutrition({
      photoDataUri: validated.data.image,
      latitude: validated.data.latitude,
      longitude: validated.data.longitude,
    });

    if (!result.foodItem || !result.nutritionalInformation) {
      return {
        status: 'error',
        message: "Actions.analysisError",
      };
    }

    if (result.nutritionalInformation === "Alimento no registrado") {
      return {
        status: 'error',
        message: "Actions.foodNotFound",
        messageValues: { foodItem: result.foodItem },
      };
    }

    const nutrients = parseNutritionString(result.nutritionalInformation);

    if (nutrients.length === 0) {
      return {
        status: 'error',
        message: "Actions.extractionError",
        messageValues: { foodItem: result.foodItem },
        data: { foodItem: result.foodItem, nutrients: [] }
      };
    }

    return {
      status: 'success',
      message: "ScanForm.analysisSuccessTitle",
      data: {
        foodItem: result.foodItem,
        nutrients,
      },
    };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: "Actions.unexpectedError" };
  }
}

export async function analyzeTextAction(foodName: string, location: { latitude: number, longitude: number } | null): Promise<AnalysisState> {
    if (!foodName) {
        return { status: 'error', message: 'Actions.foodNameRequired' };
    }

    try {
        const result = await analyzeFoodTextAndDisplayNutrition({ 
            foodName,
            latitude: location?.latitude,
            longitude: location?.longitude
        });

        if (!result.foodItem || !result.nutritionalInformation) {
            return {
                status: 'error',
                message: "Actions.textAnalysisError",
            };
        }

        if (result.nutritionalInformation === "Alimento no registrado") {
          return {
            status: 'error',
            message: "Actions.foodNotFound",
            messageValues: { foodItem: result.foodItem },
          };
        }

        const nutrients = parseNutritionString(result.nutritionalInformation);

        if (nutrients.length === 0) {
            return {
                status: 'error',
                message: "Actions.extractionError",
                messageValues: { foodItem: result.foodItem },
                data: { foodItem: result.foodItem, nutrients: [] }
            };
        }

        return {
            status: 'success',
            message: "Actions.textAnalysisSuccess",
            messageValues: { foodItem: result.foodItem },
            data: {
                foodItem: result.foodItem,
                nutrients,
            },
        };
    } catch (error) {
        console.error(error);
        return { status: 'error', message: "Actions.unexpectedError" };
    }
}

export async function getDailySummaryAction(foodItems: FoodLogItem[]) {
    if (!foodItems || foodItems.length === 0) {
        return { error: "Actions.noFoodItems" };
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
        return { error: "Actions.summaryError" };
    }
}
