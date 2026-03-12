'use server';
/**
 * @fileOverview Specialized flow for estimating food portions and absolute nutritional values from images.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatePortionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food plate, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locale: z.string().optional().describe('The language to use for the output (e.g., "es", "en").'),
});
export type EstimatePortionsInput = z.infer<typeof EstimatePortionsInputSchema>;

const EstimatePortionsOutputSchema = z.object({
  foodItem: z.string().describe('Identified food item or plate.'),
  estimatedWeightGrams: z.number().describe('Estimated total weight of the portion in grams.'),
  totalCalories: z.number().describe('Total estimated calories for this specific portion.'),
  nutrients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string()
  })).describe('Absolute nutritional values for the entire portion (not per 100g).'),
  reasoning: z.string().describe('Brief reasoning for the portion estimation based on visual cues and anatomical references.'),
  handPortions: z.array(z.object({
    type: z.enum(['palma', 'puño', 'puñado', 'pulgar', 'punta']),
    description: z.string().describe('Short label for the specific food item this portion refers to (e.g., "Arroz blanco")'),
    count: z.number().describe('Number of portions (e.g., 1, 1.5, 0.5)')
  })).optional().describe('Estimated portions based on the Hand Model (PMC8115205).')
});
export type EstimatePortionsOutput = z.infer<typeof EstimatePortionsOutputSchema>;

export async function estimatePortionsFromImage(input: EstimatePortionsInput): Promise<EstimatePortionsOutput> {
  return estimatePortionsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatePortionsFromImagePrompt',
  input: {schema: EstimatePortionsInputSchema},
  output: {schema: EstimatePortionsOutputSchema},
  prompt: `You are an expert nutritional computer vision agent specialized in mass and portion estimation.

**Your goal:**
Analyze the food image provided, estimate the total weight in grams, and calculate the ABSOLUTE nutritional values for the entire portion (not per 100g).

**Task:**
1. **Visual Volume:** Estimate total mass based on the plate, silverware, and depth.
2. **Exhaustive Absolute Nutrient Analysis:** Calculate the total content for the ENTIRE portion mass for all these nutrients: 
   Energia (kcal), Proteína (g), Grasa Total (g), Carbohidratos Totales (g), Fibra Dietética (g), Ceniza (g), Calcio (mg), Hierro (mg), Zinc (mg), Vitamina A (μg RAE), Vitamina C (mg), Tiamina (mg), Riboflavina (mg), Niacina (mg), Vitamina B6 (mg), Folato (μg DFE), Vitamina B12 (μg), Colesterol (mg), Ácidos Grasos Saturados (g), Sodio (mg), Potasio (mg), Fósforo (mg), and ALWAYS include Agua (%).
3. **Anatomical Reference (Hand Model):** Provide a breakdown of portions using the following references:
   - 'palma' (palm): Protein (meat, fish).
   - 'puño' (fist): Carbs (rice, pasta) or vegetables.
   - 'puñado' (handful): Fruits or snacks.
   - 'pulgar' (thumb): Fats/Cheeses.
   - 'punta' (fingertip): Oils/Sweets.

**Language:**
Respond in the language specified by locale: "{{{locale}}}". Default to "es".

**Context:**
{{#if latitude}}
The user is located at latitude: {{{latitude}}} and longitude: {{{longitude}}}. Use regional food composition tables (like INCAP for Central America) for ALL calculations based on endemic foods.
{{/if}}

**Crucial Requirement:** All nutrient amounts in the output MUST be absolute values for the WHOLE estimated portion mass. Do NOT return values per 100g. If the plate has 350g of food, return the total nutrients for 350g.

Photo: {{media url=photoDataUri}}
`,
});

const estimatePortionsFromImageFlow = ai.defineFlow(
  {
    name: 'estimatePortionsFromImageFlow',
    inputSchema: EstimatePortionsInputSchema,
    outputSchema: EstimatePortionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
