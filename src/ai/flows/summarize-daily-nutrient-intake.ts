'use server';

/**
 * @fileOverview Summarizes the user's daily nutrient intake based on logged food items and compares it against recommended daily values.
 *
 * - summarizeDailyNutrientIntake - A function that summarizes the daily nutrient intake.
 * - SummarizeDailyNutrientIntakeInput - The input type for the summarizeDailyNutrientIntake function.
 * - SummarizeDailyNutrientIntakeOutput - The return type for the summarizeDailyNutrientIntake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodItemSchema = z.object({
  name: z.string().describe('The name of the food item.'),
  quantity: z.number().describe('The quantity of the food item consumed (e.g., in grams).'),
  nutritionalInfo: z.record(z.string(), z.number()).describe('The nutritional information for the food item, as key-value pairs.'),
});

const SummarizeDailyNutrientIntakeInputSchema = z.object({
  foodItems: z.array(FoodItemSchema).describe('An array of food items consumed during the day.'),
  recommendedDailyValues: z.record(z.string(), z.number()).describe('A record of recommended daily values for various nutrients.'),
});

export type SummarizeDailyNutrientIntakeInput = z.infer<typeof SummarizeDailyNutrientIntakeInputSchema>;

const NutrientComparisonSchema = z.object({
  nutrient: z.string().describe('The name of the nutrient.'),
  dailyIntake: z.number().describe('The total daily intake of the nutrient.'),
  recommendedValue: z.number().describe('The recommended daily value of the nutrient.'),
  percentageOfDailyValue: z.number().describe('The percentage of the recommended daily value consumed.'),
});

const SummarizeDailyNutrientIntakeOutputSchema = z.object({
  summary: z.array(NutrientComparisonSchema).describe('A summary of the daily nutrient intake compared to recommended daily values.'),
});

export type SummarizeDailyNutrientIntakeOutput = z.infer<typeof SummarizeDailyNutrientIntakeOutputSchema>;


export async function summarizeDailyNutrientIntake(input: SummarizeDailyNutrientIntakeInput): Promise<SummarizeDailyNutrientIntakeOutput> {
  return summarizeDailyNutrientIntakeFlow(input);
}

const summarizeDailyNutrientIntakePrompt = ai.definePrompt({
  name: 'summarizeDailyNutrientIntakePrompt',
  input: {schema: SummarizeDailyNutrientIntakeInputSchema},
  output: {schema: SummarizeDailyNutrientIntakeOutputSchema},
  prompt: `You are a nutritionist summarizing a user's daily nutrient intake based on the food items they consumed and comparing it against recommended daily values.

  Food Items:
  {{#each foodItems}}
  - Name: {{this.name}}, Quantity: {{this.quantity}}g, Nutritional Info: {{JSONstringify this.nutritionalInfo}}
  {{/each}}

  Recommended Daily Values: {{JSONstringify recommendedDailyValues}}

  Generate a summary of the daily nutrient intake compared to the recommended daily values.  For each nutrient, calculate the percentage of the recommended daily value consumed.  Return results as a JSON object.
  `,
});

const summarizeDailyNutrientIntakeFlow = ai.defineFlow(
  {
    name: 'summarizeDailyNutrientIntakeFlow',
    inputSchema: SummarizeDailyNutrientIntakeInputSchema,
    outputSchema: SummarizeDailyNutrientIntakeOutputSchema,
  },
  async input => {
    const {foodItems, recommendedDailyValues} = input;

    // Calculate total intake for each nutrient
    const nutrientIntake: { [key: string]: number } = {};
    foodItems.forEach(item => {
      Object.entries(item.nutritionalInfo).forEach(([nutrient, amount]) => {
        nutrientIntake[nutrient] = (nutrientIntake[nutrient] || 0) + (amount * item.quantity / 100); // Assuming nutritional info is per 100g
      });
    });

    // Compare intake with recommended values
    const summary = Object.entries(nutrientIntake).map(([nutrient, dailyIntake]) => {
      const recommendedValue = recommendedDailyValues[nutrient] || 0; // Default to 0 if not found
      const percentageOfDailyValue = recommendedValue === 0 ? 0 : (dailyIntake / recommendedValue) * 100;

      return {
        nutrient,
        dailyIntake,
        recommendedValue,
        percentageOfDailyValue,
      };
    });

    return { summary };
  }
);
