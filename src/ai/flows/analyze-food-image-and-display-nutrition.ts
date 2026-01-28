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
  latitude: z.number().optional().describe('The latitude of the user.'),
  longitude: z.number().optional().describe('The longitude of the user.'),
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
  prompt: `You are an expert nutritionist acting as a specialized agent. Your main goal is to find the nutritional content of a food item.
{{#if latitude}}

The user is located at latitude: {{{latitude}}} and longitude: {{{longitude}}}. Use this location to provide a more accurate analysis for endemic or regional foods. For example, if the user is in Honduras and the food appears to be a "tustaca", you should analyze it as a Honduran tustaca.
{{/if}}

**Workflow for Analyzing Food:**

1.  **Identify the Food:** First, identify the food item from the image.
2.  **Determine Food Type:**
    *   **Single Ingredient:** If the food is a single item (e.g., an apple, a piece of chicken), proceed to step 4.
    *   **Prepared Dish:** If the food is a prepared dish with multiple ingredients (e.g., a Honduran breakfast, a salad, a stew), proceed to step 3.
3.  **Deconstruct Prepared Dish (if applicable):**
    *   Identify each individual ingredient in the dish (e.g., for a Honduran breakfast: beans, eggs, plantain, tortilla).
    *   Estimate the portion size (in grams) for each ingredient.
    *   For each ingredient, find its nutritional composition per 100g using the knowledge sources in step 4.
    *   Calculate the nutritional value for the estimated portion size of each ingredient.
    *   Sum the nutritional values of all ingredients to get a total nutritional profile for the entire dish.
    *   The \`foodItem\` field should be the name of the prepared dish (e.g., "Desayuno Típico Hondureño").
    *   The \`nutritionalInformation\` field should contain the *total summed nutritional values* for the entire dish.
4.  **Find Nutritional Information (for single ingredients or deconstructed items):**
    *   Use your broader general knowledge as a nutritional expert to find the typical nutritional information.
5.  **Format Output:**
    *   Return the food item name and its detailed nutritional composition. For single ingredients, this is per 100g. For prepared dishes, this is the total for the estimated portion.
    *   Include as many of the listed nutrients as possible.
    *   Provide the information in a clear, parsable format: "Nutrient: Amount Unit, Nutrient: Amount Unit". For example: "Energia: 450 kcal, Proteina: 25 g, Calcio: 150 mg".
6.  **Handle Failure:**
    *   If you cannot confidently identify the food or find its nutritional information from any source, the \`foodItem\` field in the output should be the best identification possible (e.g., "Mixed Salad", "Unknown fruit"), and the \`nutritionalInformation\` field must be the exact string "Alimento no registrado".

Now, analyze the food item in the following image:

Photo: {{media url=photoDataUri}}

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
