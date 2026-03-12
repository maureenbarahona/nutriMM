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

export const MALE_AVATAR_SVG = `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="64" cy="64" r="64" fill="#E0F2F1"/>
<circle cx="64" cy="46" r="22" fill="#00897B"/>
<path d="M24 104C24 82 40 76 64 76C88 76 104 82 104 104" fill="#00897B"/>
</svg>`;

export const FEMALE_AVATAR_SVG = `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="64" cy="64" r="64" fill="#FCE4EC"/>
<circle cx="64" cy="46" r="22" fill="#D81B60"/>
<path d="M24 104C24 82 40 76 64 76C88 76 104 82 104 104" fill="#D81B60"/>
<path d="M44 38C44 28 54 22 64 22C74 22 84 28 84 38" stroke="#D81B60" stroke-width="4" stroke-linecap="round"/>
</svg>`;
