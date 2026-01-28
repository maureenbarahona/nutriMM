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
  latitude: z.number().optional().describe('The latitude of the user.'),
  longitude: z.number().optional().describe('The longitude of the user.'),
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
  prompt: `You are an expert nutritionist acting as a specialized agent. Your main goal is to find the nutritional content of a food item based on its name.
{{#if latitude}}

The user is located at latitude: {{{latitude}}} and longitude: {{{longitude}}}. Use this location to provide a more accurate analysis for endemic or regional foods. For example, if the user is in Honduras and asks for "tustaca", you should analyze it as a Honduran tustaca.
{{/if}}

**Workflow for Analyzing Food:**

1.  **Analyze the Food Name:** Understand the food item from the provided name.
2.  **Determine Food Type:**
    *   **Single Ingredient:** If the name refers to a single item (e.g., "manzana", "pechuga de pollo"), proceed to step 4.
    *   **Prepared Dish:** If the name refers to a prepared dish with multiple ingredients (e.g., "desayuno típico hondureño", "sopa de pollo"), proceed to step 3.
3.  **Deconstruct Prepared Dish (if applicable):**
    *   Infer the typical individual ingredients for the dish (e.g., for "desayuno típico hondureño": frijoles, huevo, plátano, tortilla).
    *   Estimate a standard portion size (in grams) for each ingredient.
    *   For each ingredient, find its nutritional composition per 100g using the knowledge sources in step 4.
    *   Calculate the nutritional value for the estimated portion size of each ingredient.
    *   Sum the nutritional values of all ingredients to get a total nutritional profile for the entire dish.
    *   The \`foodItem\` field should be the name of the prepared dish you were given.
    *   The \`nutritionalInformation\` field should contain the *total summed nutritional values* for the entire dish.
4.  **Find Nutritional Information (for single ingredients or deconstructed items):**
    *   Use your broader general knowledge as a nutritional expert to find the typical nutritional information.
5.  **Format Output:**
    *   Return the food item name and its detailed nutritional composition. For single ingredients, this is per 100g. For prepared dishes, this is the total for the estimated portion.
    *   Include as many of the listed nutrients as possible.
    *   Provide the information in a clear, parsable format: "Nutrient: Amount Unit, Nutrient: Amount Unit". For example: "Energia: 450 kcal, Proteina: 25 g, Calcio: 150 mg".
6.  **Handle Failure:**
    *   If the provided name is too generic, ambiguous, or you cannot find its nutritional information from any source, the \`foodItem\` field in the output should be the original food name you were given, and the \`nutritionalInformation\` field must be the exact string "Alimento no registrado".

Now, analyze the following food item:

Food Name: {{{foodName}}}

Return the food item name and its detailed nutritional composition, including as many of the following as possible:
- Agua (%)
- Energia (Kcal)
- Proteina (g)
- Grasa Total (g)
- Carbohidratos (g)
- Fibra Diet. total (g)
- Ceniza (g)
- Calcio (mg)
- Fosforo (mg)
- Hierro (mg)
- Tiamina (mg)
- Riboflavina (mg)
- Niacina (mg)
- Vit. C (mg)
- Vit. A Equiv. Retinol (mcg)
- Ác. grasos mono-insat. (g)
- Ác. grasos poli-insat. (g)
- Ác. Grasos saturados (g)
- Colesterol (mg)
- Potasio (mg)
- Sodio (mg)
- Zinc (mg)
- Magnesio (mg)
- Vit. B6 (mg)
- Vit. B12 (mcg)
- Ac. Fólico (mcg)
- Folato Equiv. FD (mcg)
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
