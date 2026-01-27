import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Nutrient } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNutritionString(nutritionString: string): Nutrient[] {
  if (!nutritionString || typeof nutritionString !== 'string') return [];

  const nutrients: Nutrient[] = [];
  const regex = /([\w\s\(\)]+?)\s*:\s*([\d,]+\.?[\d]*)\s*(\w*)/g;
  let match;

  while ((match = regex.exec(nutritionString)) !== null) {
    nutrients.push({
      name: match[1].trim(),
      amount: parseFloat(match[2].replace(',', '')),
      unit: match[3].trim() || 'g',
    });
  }
  
  // Fallback for simple comma-separated lists if regex fails
  if (nutrients.length === 0) {
    const parts = nutritionString.split(',').map(p => p.trim());
    const fallbackRegex = /([\w\s]+):\s*([\d.]+)\s*(\w*)/;
    for (const part of parts) {
      const fallbackMatch = part.match(fallbackRegex);
      if (fallbackMatch) {
        nutrients.push({
          name: fallbackMatch[1].trim(),
          amount: parseFloat(fallbackMatch[2]),
          unit: fallbackMatch[3].trim() || 'g',
        });
      }
    }
  }

  return nutrients;
}

export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
