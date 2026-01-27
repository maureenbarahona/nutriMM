'use client';

import type { Nutrient } from '@/lib/types';
import { getNutrientIcon } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from './ui/card';
import { useLanguage } from '@/context/language-context';

const groupNutrients = (nutrients: Nutrient[]) => {
  const grouped: {
    macronutrients: Nutrient[];
    micronutrients: Nutrient[];
    water: Nutrient[];
  } = {
    macronutrients: [],
    micronutrients: [],
    water: [],
  };

  const MACRONUTRIENT_KEYS = ['protein', 'carbohydrate', 'fat', 'fiber', 'proteina', 'carbohidrato', 'grasa', 'fibra', 'calories', 'energia', 'kcal', 'ceniza', 'colesterol', 'ác. grasos'];
  const WATER_KEYS = ['water', 'agua'];

  for (const nutrient of nutrients) {
    const nameLower = nutrient.name.toLowerCase();
    if (MACRONUTRIENT_KEYS.some(key => nameLower.includes(key))) {
      grouped.macronutrients.push(nutrient);
    } else if (WATER_KEYS.some(key => nameLower.includes(key))) {
      grouped.water.push(nutrient);
    } else {
      grouped.micronutrients.push(nutrient);
    }
  }

  // Sort macronutrients to have Calories first
  grouped.macronutrients.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName.includes('calories') || aName.includes('energia')) return -1;
    if (bName.includes('calories') || bName.includes('energia')) return 1;
    if (aName.includes('protein') || aName.includes('proteina')) return -1;
    if (bName.includes('protein') || bName.includes('proteina')) return 1;
    return 0;
  });
  
  // Sort micronutrients alphabetically
  grouped.micronutrients.sort((a,b) => a.name.localeCompare(b.name));

  return grouped;
};

export function NutrientTable({ nutrients }: { nutrients: Nutrient[] }) {
    const { t } = useLanguage();
    const groupedNutrients = groupNutrients(nutrients);

    const renderNutrientRow = (nutrient: Nutrient) => {
        const Icon = getNutrientIcon(nutrient.name);
        return (
            <TableRow key={nutrient.name}>
                <TableCell className="font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{nutrient.name}</span>
                </TableCell>
                <TableCell className="text-right">
                    {nutrient.amount.toLocaleString()} {nutrient.unit}
                </TableCell>
            </TableRow>
        );
    };

    const renderGroupHeader = (title: string) => (
      <TableRow className="bg-secondary hover:bg-secondary">
          <TableCell colSpan={2} className="font-semibold text-secondary-foreground">{title}</TableCell>
      </TableRow>
  );

  return (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('NutritionResultCard.nutrient')}</TableHead>
                    <TableHead className="text-right">{t('NutritionResultCard.amountPer100g')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {groupedNutrients.macronutrients.length > 0 && renderGroupHeader(t('NutritionResultCard.macronutrients'))}
                {groupedNutrients.macronutrients.map(renderNutrientRow)}
                
                {groupedNutrients.micronutrients.length > 0 && renderGroupHeader(t('NutritionResultCard.micronutrients'))}
                {groupedNutrients.micronutrients.map(renderNutrientRow)}

                {groupedNutrients.water.length > 0 && renderGroupHeader(t('NutritionResultCard.water'))}
                {groupedNutrients.water.map(renderNutrientRow)}
            </TableBody>
        </Table>
    </Card>
  );
}
