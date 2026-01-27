'use server';

/**
 * @fileOverview A flow to suggest alternative foods with similar or better nutritional profiles.
 *
 * - suggestAlternativeFoods - A function that suggests alternative foods based on the input food's nutritional profile.
 * - SuggestAlternativeFoodsInput - The input type for the suggestAlternativeFoods function.
 * - SuggestAlternativeFoodsOutput - The return type for the suggestAlternativeFoods function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeFoodsInputSchema = z.object({
  foodItem: z.string().describe('The name of the food item to find alternatives for.'),
  nutritionalProfile: z.string().describe('The nutritional profile of the food item.'),
});
export type SuggestAlternativeFoodsInput = z.infer<typeof SuggestAlternativeFoodsInputSchema>;

const SuggestAlternativeFoodsOutputSchema = z.object({
  alternatives: z.array(z.string()).describe('A list of alternative food suggestions.'),
  reasoning: z.string().describe('The reasoning behind the suggested alternatives.'),
});
export type SuggestAlternativeFoodsOutput = z.infer<typeof SuggestAlternativeFoodsOutputSchema>;

export async function suggestAlternativeFoods(input: SuggestAlternativeFoodsInput): Promise<SuggestAlternativeFoodsOutput> {
  return suggestAlternativeFoodsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeFoodsPrompt',
  input: {schema: SuggestAlternativeFoodsInputSchema},
  output: {schema: SuggestAlternativeFoodsOutputSchema},
  prompt: `You are a nutritionist recommending alternative foods with similar or better nutritional profiles based on the INCAP data.

  Given the following food item and its nutritional profile:
  Food Item: {{{foodItem}}}
  Nutritional Profile: {{{nutritionalProfile}}}

  Suggest at least three alternative foods and provide a brief reasoning for each suggestion.
  Focus on key nutrients from the INCAP data to justify your recommendations.

  Format your response as a JSON object with the following structure:
  {
    "alternatives": ["Alternative Food 1", "Alternative Food 2", "Alternative Food 3"],
    "reasoning": "Reasoning for the suggested alternatives based on nutritional profiles."
  }`,
});

const suggestAlternativeFoodsFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeFoodsFlow',
    inputSchema: SuggestAlternativeFoodsInputSchema,
    outputSchema: SuggestAlternativeFoodsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
