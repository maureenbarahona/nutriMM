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
Analyze the food image provided and estimate the total weight of the food on the plate in grams and the visual portions using the **Hand Model (PMC8115205)**.

**Task:**
1. **Visual Volume:** Estimate total mass based on the size of the plate, silverware, and depth of the food.
2. **Anatomical Reference (Hand Model):** Provide a breakdown of portions using the following references:
   - 'palma' (palm): Protein (meat, fish).
   - 'puño' (fist): Carbs (rice, pasta) or vegetables.
   - 'puñado' (handful): Fruits or snacks.
   - 'pulgar' (thumb): Fats/Cheeses.
   - 'punta' (fingertip): Oils/Sweets.

**Language:**
Respond in the language specified by locale: "{{{locale}}}". Default to "es" if not provided.

**Context:**
{{#if latitude}}
The user is located at latitude: {{{latitude}}} and longitude: {{{longitude}}}. ALWAYS prioritize nutritional data from regional food composition tables (like INCAP for Central America) for the identified ingredients.
{{/if}}

**Requirements for Output:**
- Provide Total Calories, Protein (g), Fat (g), Carbohydrates (g), Fiber (g), and Sodium (mg) for the ENTIRE estimated mass.
- Explain the reasoning.
- Always include 'Agua' (Water) in the nutrients list with '%' as the unit.
- Populate 'handPortions' with the specific references found in the image.

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
