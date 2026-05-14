'use server';
/**
 * @fileOverview Analyzes a food name using INCAP standards for Central America and precise Glycemic Index (GI).
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
  prompt: `You are an expert nutritionist specialized in regional food composition tables (INCAP for Central America) and the Glycemic Index (GI) based on glycemic-index.net.

**CRITICAL DATA SOURCE RULE:**
For Central America and Panama, ALWAYS use the **Tabla de Composición de Alimentos del INCAP**. dataSource must be exactly "Tabla de Composición de Alimentos del INCAP".

**GLYCEMIC INDEX (GI) RULES:**
1. **Source:** Reference standards from **glycemic-index.net**.
2. **GI vs GL:** You MUST calculate the **Glycemic Index (GI)**, NOT the Glycemic Load (GL). Do not confuse them. 
3. **Preparation Impact:** Consider the preparation method (raw vs. cooked). Example: Cooked carrots have a High GI (~85) even if they have a low GL.
4. **Standards:**
   - Low GI: 55 or less.
   - Medium GI: 56 to 69.
   - High GI: 70 or more.

**Task:**
Identify the food item per 100g. Provide an exhaustive profile (Energia, Proteína, Grasa, Carbohidratos, Fibra, Agua%, etc.) and a scientifically accurate GI.

**Context:**
{{#if latitude}}
The user is at latitude: {{{latitude}}}, longitude: {{{longitude}}} (Central America region).
{{/if}}

**Language:**
Respond in locale: "{{{locale}}}". Default to "es".

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
