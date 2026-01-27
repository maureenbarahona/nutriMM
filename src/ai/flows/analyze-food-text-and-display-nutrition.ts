'use server';
/**
 * @fileOverview Analyzes a food name and displays its nutritional information from the INCAP database.
 *
 * - analyzeFoodTextAndDisplayNutrition - A function that handles the food name analysis and nutritional information display.
 * - AnalyzeFoodTextAndDisplayNutritionInput - The input type for the analyzeFoodTextAndDisplayNutrition function.
 * - AnalyzeFoodTextAndDisplayNutritionOutput - The return type for the analyzeFoodTextAndDisplayNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodTextAndDisplayNutritionInputSchema = z.object({
  foodName: z.string().describe('The name of the food item.'),
});
export type AnalyzeFoodTextAndDisplayNutritionInput = z.infer<typeof AnalyzeFoodTextAndDisplayNutritionInputSchema>;

const AnalyzeFoodTextAndDisplayNutritionOutputSchema = z.object({
  foodItem: z.string().describe('The identified food item.'),
  nutritionalInformation: z.string().describe('The nutritional information of the food item.'),
});
export type AnalyzeFoodTextAndDisplayNutritionOutput = z.infer<typeof AnalyzeFoodTextAndDisplayNutritionOutputSchema>;

export async function analyzeFoodTextAndDisplayNutrition(input: AnalyzeFoodTextAndDisplayNutritionInput): Promise<AnalyzeFoodTextAndDisplayNutritionOutput> {
  return analyzeFoodTextAndDisplayNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodTextAndDisplayNutritionPrompt',
  input: {schema: AnalyzeFoodTextAndDisplayNutritionInputSchema},
  output: {schema: AnalyzeFoodTextAndDisplayNutritionOutputSchema},
  prompt: `You are a nutritional expert. You will analyze the name of a food item and use the INCAP database (https://www.sennutricion.org/media/tablas/INCAP.pdf) to determine its nutritional information.

Analyze the following food item:

Food Name: {{{foodName}}}

Return the food item name and its nutritional information. Provide a detailed nutritional composition including:
- Macronutrients (Calories, Proteins, Fats, Carbohydrates, Fiber)
- Key Minerals (e.g., Calcium, Iron, Potassium, Sodium)
- Key Vitamins (e.g., Vitamin A, Vitamin C)
- Water content.

Provide the information in a clear, parsable format, like "Nutrient: Amount Unit".
For example: "Calories: 52 kcal, Protein: 0.3 g, Vitamin C: 4.6 mg".
`,
});

const analyzeFoodTextAndDisplayNutritionFlow = ai.defineFlow(
  {
    name: 'analyzeFoodTextAndDisplayNutritionFlow',
    inputSchema: AnalyzeFoodTextAndDisplayNutritionInputSchema,
    outputSchema: AnalyzeFoodTextAndDisplayNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
