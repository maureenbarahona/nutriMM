'use server';
/**
 * @fileOverview Specialized flow for estimating food portions and absolute nutritional values from images.
 * Inspired by the Nutrition5k (CVPR 2021) approach of mass-based nutritional prediction.
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
  reasoning: z.string().describe('Brief reasoning for the portion estimation based on visual cues.'),
});
export type EstimatePortionsOutput = z.infer<typeof EstimatePortionsOutputSchema>;

export async function estimatePortionsFromImage(input: EstimatePortionsInput): Promise<EstimatePortionsOutput> {
  return estimatePortionsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatePortionsFromImagePrompt',
  input: {schema: EstimatePortionsInputSchema},
  output: {schema: EstimatePortionsOutputSchema},
  prompt: `You are an expert nutritional computer vision agent specialized in mass estimation and caloric prediction, following the methodology of the Nutrition5k research paper.

**Context:**
{{#if latitude}}
The user is located at latitude: {{{latitude}}} and longitude: {{{longitude}}}. Use this location to prioritize nutritional data from regional food composition tables (like INCAP for Central America) to ensure the values reflect local food varieties and preparation methods.
{{/if}}

**Your goal:**
Analyze the food image provided and perform the following:

1. **Mass Estimation:** Estimate the total weight of the food on the plate in grams. Use visual cues like the size of the plate, silverware, or common reference objects if present.
2. **Absolute Nutritional Breakdown:** Use the composition table relevant to the user's region to calculate the TOTAL nutritional content for the entire estimated mass of the plate.
3. **Reasoning:** Explain why you estimated that weight (e.g., "The serving size of the rice occupies half of a standard 10-inch plate...").

**Requirements for Output:**
- Focus on the identified food items.
- Provide Total Calories, Protein (g), Fat (g), Carbohydrates (g), Fiber (g), and Sodium (mg).
- If multiple food items are present, aggregate them into a single portion estimation for the plate.
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
