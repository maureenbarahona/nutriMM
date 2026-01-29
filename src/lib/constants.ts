import { Flame, Brain, Beef, Wheat, Leaf, Droplet, type LucideIcon } from 'lucide-react';

export const NUTRIENT_ICONS: Record<string, LucideIcon> = {
  default: Brain,
  calories: Flame,
  protein: Beef,
  carbohydrates: Wheat,
  fiber: Leaf,
  fat: Droplet,
  energia: Flame,
  proteina: Beef,
  carbohidratos: Wheat,
  fibra: Leaf,
  grasa: Droplet,
  agua: Droplet,
};

export const getNutrientIcon = (nutrientName: string): LucideIcon => {
  const lowerCaseName = nutrientName.toLowerCase();
  for (const key in NUTRIENT_ICONS) {
    if (lowerCaseName.includes(key)) {
      return NUTRIENT_ICONS[key];
    }
  }
  return NUTRIENT_ICONS.default;
};
