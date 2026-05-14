'use server';
/**
 * @fileOverview Specialized flow for estimating food portions using INCAP and precise Glycemic Index.
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
  }).describe('Estimation of the Glycemic Index based on glycemic-index.net standards.'),
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

**CRITICAL DATA SOURCE RULE:**
For Central America and Panama, ALWAYS use the **Tabla de Composición de Alimentos del INCAP**.

**GLYCEMIC INDEX (GI) ANALYSIS (Reference: glycemic-index.net):**
1. **GI vs GL:** Focus strictly on the **Glycemic Index (GI)** value. Do NOT use Glycemic Load (GL) categories as GI. 
2. **Contextual GI:** Estimate the average GI for the meal. Be aware that preparation significantly alters GI. (e.g., Cooked carrot = High GI 85; Raw carrot = Low GI 35).
3. **GI Categories:** 
   - Low GI: 55 or less (slow absorption).
   - Medium GI: 56 to 69.
   - High GI: 70 or more (rapid glucose spikes).

{{#if overrideFoodItem}}
**USER IDENTIFIED AS:** "{{{overrideFoodItem}}}". Use this as the primary ground truth.
{{/if}}

**Task:**
1. Estimate physical scale and total weight (grams).
2. Calculate absolute nutrients for the entire portion using INCAP.
3. Apply Hand Model (PMC8115205).
4. Provide a scientifically sound GI value and category.

**Language:**
Respond in locale: "{{{locale}}}". Default to "es".

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
