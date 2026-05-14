'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NutrientTable } from './nutrient-table';
import { useLanguage } from '@/context/language-context';
import { Flame, Scale, Info, Utensils, Database, Sparkles, Hand, Pencil, Loader2, Activity } from 'lucide-react';
import type { PortionAnalysis } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useFoodLog } from '@/hooks/use-food-log';
import { useToast } from '@/hooks/use-toast';
import { estimatePortionsAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PortionResultCardProps {
  result: PortionAnalysis;
  originalImage: string | null;
  location: { latitude: number; longitude: number } | null;
}

export function PortionResultCard({ result: initialResult, originalImage, location }: PortionResultCardProps) {
  const { t, locale } = useLanguage();
  const { addFoodItem } = useFoodLog();
  const { toast } = useToast();

  const [result, setResult] = useState<PortionAnalysis>(initialResult);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(initialResult.foodItem);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleLog = () => {
    addFoodItem({
      name: result.foodItem,
      quantity: result.estimatedWeightGrams,
      nutrients: result.nutrients
    });
    toast({
      title: t('FoodLog.loggedToastTitle'),
      description: t('FoodLog.loggedToastDescription', { quantity: result.estimatedWeightGrams, name: result.foodItem }),
    });
  };

  const handleRecalculate = async () => {
    if (!originalImage || !editedName.trim()) return;

    setIsRecalculating(true);
    setIsDialogOpen(false);

    const formData = new FormData();
    formData.append('image', originalImage);
    formData.append('overrideFoodItem', editedName);
    formData.append('locale', locale);
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }

    try {
      const actionResult = await estimatePortionsAction(null, formData);
      if (actionResult.status === 'success' && actionResult.data) {
        setResult(actionResult.data);
        toast({
          title: t('PortionEstimator.success'),
          description: `${actionResult.data.foodItem} recalculated.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('ScanForm.analysisFailedTitle'),
          description: t(actionResult.message || 'Actions.unexpectedError'),
        });
      }
    } catch (error) {
      console.error('Recalculate error:', error);
      toast({
        variant: 'destructive',
        title: t('ScanForm.analysisFailedTitle'),
        description: t('Actions.unexpectedError'),
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const giColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  return (
    <Card className={cn(
      "w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-500 overflow-hidden border-2 transition-all",
      isRecalculating ? "opacity-70 grayscale-[0.5] border-primary/40" : "border-primary/20"
    )}>
      <CardHeader className="bg-primary/5 relative">
        {isRecalculating && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] z-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="w-full">
            <div className="flex items-start gap-3 group">
              <CardTitle className="text-3xl font-headline text-primary mb-1">
                {result.foodItem}
              </CardTitle>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-primary/40 hover:text-primary hover:bg-primary/10 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{t('PortionEstimator.editDialogTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('PortionEstimator.editDialogDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      id="name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="col-span-3"
                      placeholder={t('ManualEntryForm.foodNamePlaceholder')}
                    />
                  </div>
                  <DialogFooter className="flex flex-row justify-end gap-2">
                    <Button variant="ghost" onClick={() => { setIsDialogOpen(false); setEditedName(result.foodItem); }}>
                      {t('PortionEstimator.cancelButton')}
                    </Button>
                    <Button onClick={handleRecalculate} disabled={isRecalculating}>
                      {isRecalculating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {t('PortionEstimator.recalculateButton')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="flex items-center gap-2 text-foreground/70">
              <Utensils className="h-4 w-4" />
              {t('PortionResultCard.absoluteValuesNote')}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-white flex items-center gap-1.5 h-auto">
              <Database className="h-3 w-3 text-primary shrink-0" />
              <span className="text-left">{result.dataSource || t('PortionResultCard.compositionTableBadge')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Flame className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{result.totalCalories.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Kcal</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Scale className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{result.estimatedWeightGrams}g</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('PortionResultCard.estimatedWeight')}</p>
            </CardContent>
          </Card>

          {/* Glycemic Index Traffic Light */}
          {result.glycemicIndex && (
            <Card className="bg-secondary/30 border-none shadow-none col-span-2 md:col-span-1">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="flex gap-1 mb-2">
                  <div className={cn("w-3 h-3 rounded-full border border-black/10", result.glycemicIndex.category === 'high' ? giColors.high : 'bg-gray-200')} />
                  <div className={cn("w-3 h-3 rounded-full border border-black/10", result.glycemicIndex.category === 'medium' ? giColors.medium : 'bg-gray-200')} />
                  <div className={cn("w-3 h-3 rounded-full border border-black/10", result.glycemicIndex.category === 'low' ? giColors.low : 'bg-gray-200')} />
                </div>
                <p className="text-2xl font-bold">{result.glycemicIndex.value.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">IG ({t(`PortionResultCard.gi_${result.glycemicIndex.category}`)})</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* GI Details Section */}
        {result.glycemicIndex && (
          <div className={cn(
            "p-4 rounded-xl border flex items-start gap-4",
            result.glycemicIndex.category === 'low' ? "bg-green-50 border-green-200" :
            result.glycemicIndex.category === 'medium' ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"
          )}>
            <Activity className={cn("h-6 w-6 shrink-0 mt-1", 
              result.glycemicIndex.category === 'low' ? "text-green-600" :
              result.glycemicIndex.category === 'medium' ? "text-yellow-600" : "text-red-600"
            )} />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
                {t('PortionResultCard.gi_title')}: {t(`PortionResultCard.gi_${result.glycemicIndex.category}`)}
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{result.glycemicIndex.description}"
              </p>
            </div>
          </div>
        )}

        {/* Hand Model Section */}
        {result.handPortions && result.handPortions.length > 0 && (
          <div className="bg-secondary/20 p-6 rounded-2xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Hand className="h-5 w-5" />
              <h4 className="font-bold text-lg">{t('NutritionResultCard.handEstimationTitle')}</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.handPortions.map((portion, idx) => (
                <div key={idx} className="bg-white/80 p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t(`PortionTypes.${portion.type}`)}
                  </span>
                  <span className="text-3xl font-black text-primary">x{portion.count}</span>
                  <span className="text-xs italic text-foreground/70 leading-tight">
                    {portion.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 pt-2 text-[10px] text-muted-foreground leading-relaxed">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              <p>{t('NutritionResultCard.handMethodNote')}</p>
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm italic text-foreground/80 leading-relaxed">
            "{result.reasoning}"
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            {t('NutritionResultCard.nutrient')}
          </h4>
          <NutrientTable 
            nutrients={result.nutrients} 
            amountHeader={t('PortionResultCard.amountTotal')}
          />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 border-t p-6">
        <Button onClick={handleLog} disabled={isRecalculating} className="w-full h-12 text-lg bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
          {t('NutritionResultCard.logFoodButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
