'use server';
/**
 * @fileOverview Specialized flow for estimating food portions and absolute nutritional values from images.
 * Uses a hybrid approach combining mass-based prediction (Nutrition5k) and anatomical reference (Hand Model PMC8115205).
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
});
export type EstimatePortionsOutput = z.infer<typeof EstimatePortionsOutputSchema>;

export async function estimatePortionsFromImage(input: EstimatePortionsInput): Promise<EstimatePortionsOutput> {
  return estimatePortionsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatePortionsFromImagePrompt',
  input: {schema: EstimatePortionsInputSchema},
  output: {schema: EstimatePortionsOutputSchema},
  prompt: `You are an expert nutritional computer vision agent specialized in mass estimation.

**Your goal:**
Analyze the food image provided and estimate the total weight of the food on the plate in grams using a hybrid approach:
1. **Visual Volume (Nutrition5k Methodology):** Estimate mass based on the size of the plate, silverware, and depth of the food.
2. **Anatomical Reference (Hand Model PMC8115205):** Use the user's hand if present in the photo as a scale (Palm = protein, Fist = carbs/veg, Handful = fruit, etc.).

**Context:**
{{#if latitude}}
The user is located at latitude: {{{latitude}}} and longitude: {{{longitude}}}. ALWAYS prioritize nutritional data from regional food composition tables (like INCAP for Central America) for the identified ingredients.
{{/if}}

**Requirements for Output:**
- Provide Total Calories, Protein (g), Fat (g), Carbohydrates (g), Fiber (g), and Sodium (mg) for the ENTIRE estimated mass.
- Explain the reasoning (e.g., "The portion size was estimated based on its visual volume compared to a standard 10-inch plate...").
- Always include 'Agua' (Water) in the nutrients list with '%' as the unit.

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
