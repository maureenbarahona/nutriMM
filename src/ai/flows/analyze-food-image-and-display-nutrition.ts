'use server';
/**
 * @fileOverview Analyzes a food image and displays its nutritional information and hand-based portion estimation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodImageAndDisplayNutritionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locale: z.string().optional().describe('The language to use for the output (e.g., "es", "en").'),
});

const AnalyzeFoodImageAndDisplayNutritionOutputSchema = z.object({
  foodItem: z.string().describe('The identified food item.'),
  nutritionalInformation: z.string().describe('The nutritional information of the food item.'),
  handPortions: z.array(z.object({
    type: z.enum(['palma', 'puño', 'puñado', 'pulgar', 'punta']),
    description: z.string(),
    count: z.number()
  })).optional().describe('Estimated portions based on the Hand Model (PMC8115205).')
});

export type AnalyzeFoodImageAndDisplayNutritionInput = z.infer<typeof AnalyzeFoodImageAndDisplayNutritionInputSchema>;
export type AnalyzeFoodImageAndDisplayNutritionOutput = z.infer<typeof AnalyzeFoodImageAndDisplayNutritionOutputSchema>;

export async function analyzeFoodImageAndDisplayNutrition(input: AnalyzeFoodImageAndDisplayNutritionInput): Promise<AnalyzeFoodImageAndDisplayNutritionOutput> {
  return analyzeFoodImageAndDisplayNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImageAndDisplayNutritionPrompt',
  input: {schema: AnalyzeFoodImageAndDisplayNutritionInputSchema},
  output: {schema: AnalyzeFoodImageAndDisplayNutritionOutputSchema},
  prompt: `You are an expert nutritionist specialized in visual portion estimation and regional food composition tables (like INCAP).

**Task:**
1. Identify the food item accurately.
2. Provide a COMPREHENSIVE nutritional analysis per 100g. You MUST attempt to return all standard nutrients found in official composition tables:
   - Energia (kcal), Proteína (g), Grasa Total (g), Carbohidratos Totales (g), Fibra Dietética (g), Ceniza (g), Calcio (mg), Hierro (mg), Zinc (mg), Vitamina A (μg RAE), Vitamina C (mg), Tiamina (mg), Riboflavina (mg), Niacina (mg), Vitamina B6 (mg), Folato (μg DFE), Vitamina B12 (μg), Colesterol (mg), Ácidos Grasos Saturados (g), Sodio (mg), Potasio (mg), Fósforo (mg), and ALWAYS include Agua (%).

3. Estimate portions using the **Hand Model (PMC8115205)**:
   - 'palma' (palm): Protein (meat, fish).
   - 'puño' (fist): Carbs (rice, pasta) or vegetables.
   - 'puñado' (handful): Fruits or snacks.
   - 'pulgar' (thumb): Fats/Cheeses.
   - 'punta' (fingertip): Oils/Sweets.

**Context:**
{{#if latitude}}
The user is at latitude: {{{latitude}}}, longitude: {{{longitude}}}. Use regional databases (e.g., INCAP for Central America) for endemic foods.
{{/if}}

**Language:**
Respond in the language specified by locale: "{{{locale}}}". Default to "es".

**Nutrient format:**
"Nutrient: Amount Unit, Nutrient: Amount Unit". Use standard names.

Photo: {{media url=photoDataUri}}`,
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
