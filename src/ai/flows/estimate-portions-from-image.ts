'use server';
/**
 * @fileOverview Specialized flow for estimating food portions and absolute nutritional values from images.
 * Uses Nutrition5k logic and PMC8115205 (Hand Model) for consistent mass estimation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatePortionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food plate, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  overrideFoodItem: z.string().optional().describe('A manual correction of the food identification provided by the user.'),
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
  })).optional().describe('Estimated portions based on the Hand Model (PMC8115205).'),
  dataSource: z.string().describe('The name of the official food composition table used (e.g., "Tabla de Composición de Alimentos del INCAP").')
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

**Goal:**
Estimate the total weight in grams and calculate the ABSOLUTE nutritional values for the ENTIRE portion shown in the image.

{{#if overrideFoodItem}}
**IMPORTANT CORRECTION:** 
The user has manually corrected the identification of this food to: "{{{overrideFoodItem}}}". 
You MUST use this description as the absolute source of truth for your calculations, overriding what you visually identify if there is a conflict. Recalculate all nutritional values based on this specific description.
{{/if}}

**Step-by-Step Consistent Estimation Logic:**
1. **Calibration:** Use the plate (assume standard 26cm diameter if not obvious) and silverware to establish a physical scale.
2. **Segmentation:** Identify each individual food component on the plate.
3. **Volume Estimation:** Estimate the surface area and depth (height) of each component.
4. **Mass Calculation:** Apply standard food densities to the estimated volume to get grams per component.
5. **Hand Model Validation (PMC8115205):** Use anatomical references to double-check:
   - 'palma' (palm): ~100-150g of protein.
   - 'puño' (fist): ~1 cup (~150-200g) of starches/veggies.
   - 'puñado' (handful): ~30-50g of snacks/fruits.
   - 'pulgar' (thumb): ~15-30g of fats/cheeses.

**Requirements:**
- **Exhaustive Nutrient Analysis:** You MUST return absolute totals for the WHOLE portion for: Energia (kcal), Proteína (g), Grasa Total (g), Carbohidratos Totales (g), Fibra Dietética (g), Ceniza (g), Calcio (mg), Hierro (mg), Zinc (mg), Vitamina A (μg RAE), Vitamina C (mg), Tiamina (mg), Riboflavina (mg), Niacina (mg), Vitamina B6 (mg), Folato (μg DFE), Vitamina B12 (μg), Colesterol (mg), Ácidos Grasos Saturados (g), Sodio (mg), Potasio (mg), Fósforo (mg), and ALWAYS include Agua (%).
- **Consistency:** Ensure estimations are conservative and grounded in the physical scale provided by the plate. Avoid radical deviations for similar visual volumes.

**Language:**
Respond in the language specified by locale: "{{{locale}}}". Default to "es".

**Context:**
{{#if latitude}}
User location: lat {{{latitude}}}, lon {{{longitude}}}. Use regional food composition tables (e.g., INCAP for Central America and Panama, USDA for USA, etc.) for all nutritional data calculations.
{{/if}}

**DataSource:** Identify the specific food composition table used based on the location and provide its full name in the "dataSource" field. If in Central America or Panama, use "Tabla de Composición de Alimentos del INCAP".

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
