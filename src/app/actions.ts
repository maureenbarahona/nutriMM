'use server';

import { analyzeFoodImageAndDisplayNutrition } from '@/ai/flows/analyze-food-image-and-display-nutrition';
import { analyzeFoodTextAndDisplayNutrition } from '@/ai/flows/analyze-food-text-and-display-nutrition';
import { summarizeDailyNutrientIntake } from '@/ai/flows/summarize-daily-nutrient-intake';
import { estimatePortionsFromImage } from '@/ai/flows/estimate-portions-from-image';
import { calculateBMIIndications } from '@/ai/flows/calculate-bmi-indications';
import { parseNutritionString } from '@/lib/utils';
import type { FoodLogItem, Nutrient, PortionAnalysis } from '@/lib/types';
import { z } from 'zod';

export type AnalysisState = {
  status: 'error' | 'success';
  message: string;
  messageValues?: Record<string, string | number>;
  data?: any;
};

const analyzeImageSchema = z.object({
  image: z.string().refine((val) => val.startsWith('data:image/'), {
    message: 'Image must be a data URI',
  }),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  locale: z.string().optional(),
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
      locale: formData.get('locale'),
    });

    if (!validated.success) {
      return { status: 'error', message: "Actions.imageRequired" };
    }

    const result = await analyzeFoodImageAndDisplayNutrition({
      photoDataUri: validated.data.image,
      latitude: validated.data.latitude,
      longitude: validated.data.longitude,
      locale: validated.data.locale,
    });

    if (!result.foodItem || !result.nutritionalInformation) {
      return {
        status: 'error',
        message: "Actions.analysisError",
      };
    }

    if (result.nutritionalInformation.includes("no registrado") || result.nutritionalInformation.includes("not registered")) {
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
    console.error('Analyze Image Error:', error);
    return { status: 'error', message: "Actions.unexpectedError" };
  }
}

const estimatePortionsSchema = z.object({
  image: z.string().refine((val) => val.startsWith('data:image/'), {
    message: 'Image must be a data URI',
  }),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  locale: z.string().optional(),
});

export async function estimatePortionsAction(
  prevState: any,
  formData: FormData
): Promise<AnalysisState> {
  try {
    const validated = estimatePortionsSchema.safeParse({
      image: formData.get('image'),
      latitude: formData.get('latitude'),
      longitude: formData.get('longitude'),
      locale: formData.get('locale'),
    });

    if (!validated.success) {
      return { status: 'error', message: "Actions.imageRequired" };
    }

    const result = await estimatePortionsFromImage({
      photoDataUri: validated.data.image,
      latitude: validated.data.latitude,
      longitude: validated.data.longitude,
      locale: validated.data.locale,
    });

    const sanitizedResult: PortionAnalysis = {
      foodItem: result.foodItem || 'Alimento desconocido',
      estimatedWeightGrams: result.estimatedWeightGrams || 0,
      totalCalories: result.totalCalories || 0,
      nutrients: (result.nutrients || []).map(n => ({
        name: n.name,
        amount: n.amount,
        unit: n.unit
      })),
      reasoning: result.reasoning || '',
      handPortions: result.handPortions,
      dataSource: result.dataSource,
    };

    return {
      status: 'success',
      message: "PortionEstimator.success",
      data: sanitizedResult,
    };
  } catch (error) {
    console.error('Estimate Portions Error:', error);
    return { status: 'error', message: "Actions.unexpectedError" };
  }
}

export async function analyzeTextAction(foodName: string, location: { latitude: number, longitude: number } | null, locale: string = 'es'): Promise<AnalysisState> {
    if (!foodName) {
        return { status: 'error', message: 'Actions.foodNameRequired' };
    }

    try {
        const result = await analyzeFoodTextAndDisplayNutrition({ 
            foodName,
            latitude: location?.latitude,
            longitude: location?.longitude,
            locale
        });

        if (!result.foodItem || !result.nutritionalInformation) {
            return {
                status: 'error',
                message: "Actions.textAnalysisError",
            };
        }

        if (result.nutritionalInformation.includes("no registrado") || result.nutritionalInformation.includes("not registered")) {
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
            messageValues: { foodName },
            data: {
                foodItem: result.foodItem,
                nutrients,
            },
        };
    } catch (error) {
        console.error('Analyze Text Error:', error);
        return { status: 'error', message: "Actions.unexpectedError" };
    }
}

export async function calculateBMIAction(
    bmi: number, 
    age: number, 
    gender: 'male' | 'female', 
    weight: number, 
    height: number, 
    activityLevel: 'sedentary' | 'moderate' | 'active',
    isPregnant: boolean = false,
    isBreastfeeding: boolean = false,
    locale: string = 'es'
) {
    try {
        const result = await calculateBMIIndications({
            bmi,
            age,
            gender,
            weight,
            height,
            activityLevel,
            isPregnant,
            isBreastfeeding,
            locale
        });
        return { data: result };
    } catch (error) {
        console.error('Calculate BMI Error:', error);
        return { error: 'Actions.unexpectedError' };
    }
}

export async function getDailySummaryAction(foodItems: FoodLogItem[]) {
    if (!foodItems || foodItems.length === 0) {
        return { error: "Actions.noFoodItems" };
    }

    const recommendedDailyValues = {
        'Calories': 2000,
        'Protein': 50,
        'Carbohydrates': 275,
        'Fat': 78,
        'Fiber': 28,
    };
    
    const flowInputItems = foodItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        nutritionalInfo: item.nutrients.reduce((acc, nutrient) => {
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
