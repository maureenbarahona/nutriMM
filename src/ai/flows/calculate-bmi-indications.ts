
'use server';
/**
 * @fileOverview Calculates nutritional status, BMI indications, and daily calorie requirements.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateBMIInputSchema = z.object({
  bmi: z.number().describe('The calculated Body Mass Index value.'),
  age: z.number().describe('The age of the person.'),
  gender: z.enum(['male', 'female']).describe('The gender of the person.'),
  weight: z.number().describe('Weight in kg.'),
  height: z.number().describe('Height in cm.'),
  activityLevel: z.enum(['sedentary', 'moderate', 'active']).describe('The physical activity level.'),
  isPregnant: z.boolean().optional().describe('Whether the person is pregnant.'),
  isBreastfeeding: z.boolean().optional().describe('Whether the person is breastfeeding.'),
  locale: z.string().optional().describe('The language to use for the output (e.g., "es", "en").'),
});
export type CalculateBMIInput = z.infer<typeof CalculateBMIInputSchema>;

const CalculateBMIOutputSchema = z.object({
  status: z.string().describe('The weight status (e.g., "Normal", "Overweight").'),
  medicalIndications: z.string().describe('Medical advice and indications based on the BMI and profile.'),
  estimatedDailyCalories: z.string().describe('Estimated daily calories needed based on activity and basal metabolism.'),
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
- Weight: {{{weight}}} kg
- Height: {{{height}}} cm
- Activity Level: {{{activityLevel}}}
- Is Pregnant: {{{isPregnant}}}
- Is Breastfeeding: {{{isBreastfeeding}}}

**Task:**
1. Determine the BMI status based on standard health tables.
2. Provide professional medical indications and advice.
3. Calculate the estimated daily calorie requirement (kcal/day) based on the following reference data:

**Reference Tables for Calories (kcal/day):**
- Infants (0-0.5y): ~650 kcal; (0.5-1y): ~850 kcal.
- Children (1-3y): ~1300 kcal; (4-6y): ~1800 kcal; (7-10y): ~2000 kcal.
- Men (11-14y): ~2500 kcal; (15-18y): ~3000 kcal; (19-50y): ~2900 kcal; (>51y): ~2300 kcal.
- Women (11-50y): ~2200 kcal; (>51y): ~1900 kcal.
- Pregnancy Additions: 2nd/3rd trimester: +300 kcal.
- Breastfeeding Additions: +500 kcal.

**Activity Adjustment:**
- Sedentary: Basal metabolism + minimal.
- Moderate: +20-30% over basal.
- Active: +40-50% over basal.

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
