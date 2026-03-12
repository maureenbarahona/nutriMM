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
  } = {
    macronutrients: [],
    micronutrients: [],
  };

  const MACRO_KEYWORDS = [
    'protein', 'proteína', 'carbohidrato', 'carbohydrate', 'grasa', 'fat', 
    'fibra', 'fiber', 'energia', 'energy', 'kcal', 'ceniza', 'ash', 
    'colesterol', 'cholesterol', 'grasos', 'fatty', 'agua', 'water'
  ];

  for (const nutrient of nutrients) {
    const nameLower = nutrient.name.toLowerCase();
    if (MACRO_KEYWORDS.some(key => nameLower.includes(key))) {
      grouped.macronutrients.push(nutrient);
    } else {
      grouped.micronutrients.push(nutrient);
    }
  }

  // Sort macronutrients: Energy first, then Protein, then others
  grouped.macronutrients.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName.includes('energia') || aName.includes('energy') || aName.includes('kcal')) return -1;
    if (bName.includes('energia') || bName.includes('energy') || bName.includes('kcal')) return 1;
    if (aName.includes('prote') || aName.includes('protein')) return -1;
    if (bName.includes('prote') || bName.includes('protein')) return 1;
    return 0;
  });
  
  // Sort micronutrients (Vitamins/Minerals) alphabetically
  grouped.micronutrients.sort((a,b) => a.name.localeCompare(b.name));

  return grouped;
};

export function NutrientTable({ nutrients }: { nutrients: Nutrient[] }) {
    const { t } = useLanguage();
    const groupedNutrients = groupNutrients(nutrients);

    const renderNutrientRow = (nutrient: Nutrient) => {
        const Icon = getNutrientIcon(nutrient.name);
        return (
            <TableRow key={nutrient.name} className="hover:bg-muted/30">
                <TableCell className="font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary/60" />
                    <span>{nutrient.name}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                    {nutrient.amount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} {nutrient.unit}
                </TableCell>
            </TableRow>
        );
    };

    const renderGroupHeader = (title: string) => (
      <TableRow className="bg-secondary/40 hover:bg-secondary/40 border-y-2 border-border/50">
          <TableCell colSpan={2} className="font-bold text-xs uppercase tracking-widest text-secondary-foreground py-2 px-4">{title}</TableCell>
      </TableRow>
  );

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="font-bold">{t('NutritionResultCard.nutrient')}</TableHead>
                    <TableHead className="text-right font-bold">{t('NutritionResultCard.amountPer100g')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {groupedNutrients.macronutrients.length > 0 && renderGroupHeader(t('NutritionResultCard.macronutrients'))}
                {groupedNutrients.macronutrients.map(renderNutrientRow)}
                
                {groupedNutrients.micronutrients.length > 0 && renderGroupHeader(t('NutritionResultCard.micronutrients'))}
                {groupedNutrients.micronutrients.map(renderNutrientRow)}
            </TableBody>
        </Table>
    </Card>
  );
}
