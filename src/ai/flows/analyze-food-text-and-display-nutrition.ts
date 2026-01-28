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
  prompt: `You are a nutritional expert. Your task is to provide the typical nutritional information for the given food item name, based on your general knowledge.

If the provided name is too generic, ambiguous, or you cannot determine a specific food item from it, the \`foodItem\` field in the output should be the original food name you were given, and the \`nutritionalInformation\` field should be the exact string "Alimento no registrado".

If you can identify the food, analyze the following food item:

Food Name: {{{foodName}}}

Return the food item name and its typical nutritional information. Provide a detailed nutritional composition per 100g, including as many of the following as possible:
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
