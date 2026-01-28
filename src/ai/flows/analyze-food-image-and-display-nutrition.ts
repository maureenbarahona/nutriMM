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
  prompt: `You are an expert nutritionist acting as a specialized agent. Your main goal is to find the nutritional content of a food item.

1.  **Primary Source:** Your primary knowledge base is the "Tabla de Composición de Alimentos de Centroamérica (INCAP)". First, try to identify the food in the image and find its nutritional information strictly from your knowledge of the INCAP table.
2.  **Fallback Search:** If you cannot find the exact food item in the INCAP table, use your broader general knowledge as a nutritional expert to find the typical nutritional information for the identified food.
3.  **Failure:** If you cannot confidently identify the food or find its nutritional information from any source, the \`foodItem\` field in the output should be the best identification possible (e.g., "Mixed Salad", "Unknown fruit"), and the \`nutritionalInformation\` field must be the exact string "Alimento no registrado".

Now, analyze the food item in the following image:

Photo: {{media url=photoDataUri}}

Return the food item name and its detailed nutritional composition per 100g, including as many of the following as possible:
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

Provide the information in a clear, parsable format, like "Nutrient: Amount Unit".
For example: "Energia: 88 kcal, Proteina: 0.38 g, Calcio: 27 mg".
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
