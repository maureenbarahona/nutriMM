'use server';
/**
 * @fileOverview Analyzes a food image and displays its nutritional information from the INCAP database.
 *
 * - analyzeFoodImageAndDisplayNutrition - A function that handles the food image analysis and nutritional information display.
 * - AnalyzeFoodImageAndDisplayNutritionInput - The input type for the analyzeFoodImageAndDisplayNutrition function.
 * - AnalyzeFoodImageAndDisplayNutritionOutput - The return type for the analyzeFoodImageAndDisplayNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodImageAndDisplayNutritionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFoodImageAndDisplayNutritionInput = z.infer<typeof AnalyzeFoodImageAndDisplayNutritionInputSchema>;

const AnalyzeFoodImageAndDisplayNutritionOutputSchema = z.object({
  foodItem: z.string().describe('The identified food item.'),
  nutritionalInformation: z.string().describe('The nutritional information of the food item.'),
});
export type AnalyzeFoodImageAndDisplayNutritionOutput = z.infer<typeof AnalyzeFoodImageAndDisplayNutritionOutputSchema>;

export async function analyzeFoodImageAndDisplayNutrition(input: AnalyzeFoodImageAndDisplayNutritionInput): Promise<AnalyzeFoodImageAndDisplayNutritionOutput> {
  return analyzeFoodImageAndDisplayNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImageAndDisplayNutritionPrompt',
  input: {schema: AnalyzeFoodImageAndDisplayNutritionInputSchema},
  output: {schema: AnalyzeFoodImageAndDisplayNutritionOutputSchema},
  prompt: `You are a nutritional expert. You will analyze the image of a food item and identify it. Then, you will use the INCAP database (https://www.sennutricion.org/media/tablas/INCAP.pdf) to determine its nutritional information.

Analyze the following food item:

Photo: {{media url=photoDataUri}}

Return the food item name and its nutritional information. Provide a detailed nutritional composition including:
- Macronutrients (Calories, Proteins, Fats, Carbohydrates, Fiber)
- Key Minerals (e.g., Calcium, Iron, Potassium, Sodium)
- Key Vitamins (e.g., Vitamin A, Vitamin C)
- Water content.

Provide the information in a clear, parsable format, like "Nutrient: Amount Unit".
For example: "Calories: 52 kcal, Protein: 0.3 g, Vitamin C: 4.6 mg".
`,
});

const analyzeFoodImageAndDisplayNutritionFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageAndDisplayNutritionFlow',
    inputSchema: AnalyzeFoodImageAndDisplayNutritionInputSchema,
    outputSchema: AnalyzeFoodImageAndDisplayNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
