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
  prompt: `You are an expert nutritionist specialized in visual portion estimation and INCAP database analysis.

**Task:**
1. Identify the food item.
2. Provide nutritional info per 100g. ALWAYS include 'Agua' with '%' as unit.
3. Estimate portions using the **Hand Model (PMC8115205)**:
   - 'palma' (palm): Protein (meat, fish).
   - 'puño' (fist): Carbs (rice, pasta) or vegetables.
   - 'puñado' (handful): Fruits or snacks.
   - 'pulgar' (thumb): Fats/Cheeses.
   - 'punta' (fingertip): Oils/Sweets.

Photo: {{media url=photoDataUri}}

Nutrient format: "Nutrient: Amount Unit, Nutrient: Amount Unit".
If unknown, nutritionalInformation should be "Alimento no registrado".`,
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
