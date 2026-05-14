'use server';
/**
 * @fileOverview Analyzes a food name and displays its nutritional information and Glycemic Index.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodTextAndDisplayNutritionInputSchema = z.object({
  foodName: z.string().describe('The name of the food item.'),
  latitude: z.number().optional().describe('The latitude of the user.'),
  longitude: z.number().optional().describe('The longitude of the user.'),
  locale: z.string().optional().describe('The language to use for the output (e.g., "es", "en").'),
});
export type AnalyzeFoodTextAndDisplayNutritionInput = z.infer<typeof AnalyzeFoodTextAndDisplayNutritionInputSchema>;

const AnalyzeFoodTextAndDisplayNutritionOutputSchema = z.object({
  foodItem: z.string().describe('The identified food item.'),
  nutrients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string()
  })).describe('Nutritional values per 100g.'),
  glycemicIndex: z.object({
    value: z.number().describe('Estimated Glycemic Index value.'),
    category: z.enum(['low', 'medium', 'high']).describe('The category: low (<=55), medium (56-69), high (>=70).'),
    description: z.string().describe('Short explanation of the impact on blood glucose.')
  }).describe('Estimation of the Glycemic Index based on glycemic-index.net standards.'),
  dataSource: z.string().describe('The name of the official food composition table used.')
});
export type AnalyzeFoodTextAndDisplayNutritionOutput = z.infer<typeof AnalyzeFoodTextAndDisplayNutritionOutputSchema>;

export async function analyzeFoodTextAndDisplayNutrition(input: AnalyzeFoodTextAndDisplayNutritionInput): Promise<AnalyzeFoodTextAndDisplayNutritionOutput> {
  return analyzeFoodTextAndDisplayNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodTextAndDisplayNutritionPrompt',
  input: {schema: AnalyzeFoodTextAndDisplayNutritionInputSchema},
  output: {schema: AnalyzeFoodTextAndDisplayNutritionOutputSchema},
  prompt: `You are an expert nutritionist specialized in regional food composition tables (INCAP, etc.) and Glycemic Index (GI).

**Task:**
Find the nutritional content of the food item per 100g and calculate its Glycemic Index.

**Nutritional Requirements:**
1. **Exhaustive Analysis:** Return a full profile including: Energia (kcal), Proteína (g), Grasa Total (g), Carbohidratos Totales (g), Fibra Dietética (g), Ceniza (g), Calcio (mg), Hierro (mg), Zinc (mg), Vitamina A (μg RAE), Vitamina C (mg), Tiamina (mg), Riboflavina (mg), Niacina (mg), Vitamina B6 (mg), Folato (μg DFE), Vitamina B12 (μg), Colesterol (mg), Ácidos Grasos Saturados (g), Sodio (mg), Potasio (mg), Fósforo (mg), and ALWAYS include Agua (%).

**GI Standards (Reference: glycemic-index.net):**
- Low GI: 55 or less.
- Medium GI: 56 to 69.
- High GI: 70 or more.

**Context:**
{{#if latitude}}
The user is at latitude: {{{latitude}}}, longitude: {{{longitude}}}. Use local data for regional foods.
{{/if}}

**Language:**
Respond strictly in the language specified by locale: "{{{locale}}}". Default to "es".

Food Name: {{{foodName}}}
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
