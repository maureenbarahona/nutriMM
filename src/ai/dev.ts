import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-daily-nutrient-intake.ts';
import '@/ai/flows/suggest-alternative-foods.ts';
import '@/ai/flows/analyze-food-image-and-display-nutrition.ts';
import '@/ai/flows/analyze-food-text-and-display-nutrition.ts';
