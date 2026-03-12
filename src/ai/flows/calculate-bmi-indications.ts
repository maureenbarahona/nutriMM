'use server';
/**
 * @fileOverview Calculates BMI indications and medical advice based on age, gender, and BMI value.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateBMIInputSchema = z.object({
  bmi: z.number().describe('The calculated Body Mass Index value.'),
  age: z.number().describe('The age of the person.'),
  gender: z.enum(['male', 'female']).describe('The gender of the person.'),
  locale: z.string().optional().describe('The language to use for the output (e.g., "es", "en").'),
});
export type CalculateBMIInput = z.infer<typeof CalculateBMIInputSchema>;

const CalculateBMIOutputSchema = z.object({
  status: z.string().describe('The weight status (e.g., "Normal", "Overweight").'),
  medicalIndications: z.string().describe('Medical advice and indications based on the BMI and profile.'),
});
export type CalculateBMIOutput = z.infer<typeof CalculateBMIOutputSchema>;

export async function calculateBMIIndications(input: CalculateBMIInput): Promise<CalculateBMIOutput> {
  return calculateBMIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateBMIPrompt',
  input: {schema: CalculateBMIInputSchema},
  output: {schema: CalculateBMIOutputSchema},
  prompt: `You are an expert nutritional anthropologist and medical advisor.
Given the following profile:
- BMI: {{{bmi}}}
- Age: {{{age}}}
- Gender: {{{gender}}}

**Task:**
1. Determine the BMI status (Underweight, Normal, Overweight, Obese).
2. Provide professional medical indications and advice suitable for this profile.

**Language:**
Respond strictly in the language specified by locale: "{{{locale}}}". If locale is "es", respond in Spanish. If locale is "en", respond in English. Default to "es" if not specified.

Format your output as requested.`,
});

const calculateBMIFlow = ai.defineFlow(
  {
    name: 'calculateBMIFlow',
    inputSchema: CalculateBMIInputSchema,
    outputSchema: CalculateBMIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
