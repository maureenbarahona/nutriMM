'use server';
/**
 * @fileOverview Specialized flow for estimating food portions and absolute nutritional values from images.
 * Includes Glycemic Index (GI) estimation based on international standards.
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
  })).describe('Absolute nutritional values for the entire portion.'),
  reasoning: z.string().describe('Brief reasoning for the portion estimation.'),
  handPortions: z.array(z.object({
    type: z.enum(['palma', 'puño', 'puñado', 'pulgar', 'punta']),
    description: z.string().describe('Short label for the specific food item'),
    count: z.number().describe('Number of portions')
  })).optional().describe('Estimated portions based on the Hand Model (PMC8115205).'),
  glycemicIndex: z.object({
    value: z.number().describe('Estimated Glycemic Index value.'),
    category: z.enum(['low', 'medium', 'high']).describe('The category: low (<=55), medium (56-69), high (>=70).'),
    description: z.string().describe('Short explanation of the impact on blood glucose.')
  }).optional(),
  dataSource: z.string().describe('The name of the official food composition table used.')
});
export type EstimatePortionsOutput = z.infer<typeof EstimatePortionsOutputSchema>;

export async function estimatePortionsFromImage(input: EstimatePortionsInput): Promise<EstimatePortionsOutput> {
  return estimatePortionsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatePortionsFromImagePrompt',
  input: {schema: EstimatePortionsInputSchema},
  output: {schema: EstimatePortionsOutputSchema},
  prompt: `You are an expert nutritional computer vision agent specialized in mass, portion and Glycemic Index (GI) estimation.

**Goal:**
Estimate the total weight and nutritional values for the entire portion. Additionally, perform a Glycemic Index (GI) analysis based on the information from glycemic-index.net.

**GI Standards (Reference: glycemic-index.net):**
- Low GI: 55 or less (slow absorption, stable energy).
- Medium GI: 56 to 69.
- High GI: 70 or more (rapid absorption, glucose spikes).

{{#if overrideFoodItem}}
**IMPORTANT CORRECTION:** 
The user identified this as: "{{{overrideFoodItem}}}". Use this description as the primary truth for all calculations.
{{/if}}

**Estimation Logic:**
1. Establish physical scale using standard plates/silverware.
2. Segment and estimate volume of each component.
3. Calculate mass using standard densities.
4. Validate with Hand Model (PMC8115205).
5. **GI Analysis:** Estimate the average Glycemic Index for the entire meal shown. Consider the mix of proteins, fats and fibers which can lower the overall GI.

**Requirements:**
- Exhaustive Nutrient Analysis (Absolute totals).
- GI Estimation (value, category, and description).
- Respond in the language specified by locale: "{{{locale}}}". Default to "es".

Photo: {{media url=photoDataUri}}`,
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
