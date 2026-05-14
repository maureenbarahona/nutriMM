'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NutrientTable } from './nutrient-table';
import { useLanguage } from '@/context/language-context';
import { Flame, Scale, Info, Utensils, Database, Hand, Pencil, Loader2, Activity } from 'lucide-react';
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
        {/* Main Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Flame className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-3xl font-black">{result.totalCalories.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Kcal</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Scale className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-3xl font-black">{result.estimatedWeightGrams}g</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t('PortionResultCard.estimatedWeight')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Light Semáforo section - Positioned BEFORE hand portions as requested */}
        {result.glycemicIndex && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-lg text-primary/80 uppercase tracking-wider">
                 {t('PortionResultCard.gi_title')}
              </h4>
            </div>
            
            <Card className={cn(
                "overflow-hidden border-2 transition-all shadow-sm rounded-3xl",
                result.glycemicIndex.category === 'low' ? "bg-green-50/30 border-green-200" :
                result.glycemicIndex.category === 'medium' ? "bg-yellow-50/30 border-yellow-200" : "bg-red-50/30 border-red-200"
            )}>
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                    {/* Visual Traffic Light (Semáforo) */}
                    <div className="bg-neutral-900 p-3 rounded-2xl shadow-xl flex md:flex-col gap-3 shrink-0">
                        <div className={cn(
                            "w-10 h-10 rounded-full border-2 border-white/10 transition-all duration-500",
                            result.glycemicIndex.category === 'high' ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-red-950/30"
                        )} />
                        <div className={cn(
                            "w-10 h-10 rounded-full border-2 border-white/10 transition-all duration-500",
                            result.glycemicIndex.category === 'medium' ? "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]" : "bg-yellow-950/30"
                        )} />
                        <div className={cn(
                            "w-10 h-10 rounded-full border-2 border-white/10 transition-all duration-500",
                            result.glycemicIndex.category === 'low' ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]" : "bg-green-950/30"
                        )} />
                    </div>

                    <div className="space-y-3 text-center md:text-left flex-1">
                        <div className="flex items-baseline gap-3 justify-center md:justify-start">
                            <span className="text-5xl font-black text-foreground">
                                {result.glycemicIndex.value.toFixed(0)}
                            </span>
                            <Badge className={cn(
                                "text-white font-bold px-4 py-1 text-sm uppercase rounded-lg",
                                result.glycemicIndex.category === 'low' ? "bg-green-600" :
                                result.glycemicIndex.category === 'medium' ? "bg-yellow-600" : "bg-red-600"
                            )}>
                                {t(`PortionResultCard.gi_${result.glycemicIndex.category}`)}
                            </Badge>
                        </div>
                        <p className="text-base text-foreground/80 leading-relaxed font-medium italic">
                            "{result.glycemicIndex.description}"
                        </p>
                        <div className="flex items-center gap-2 justify-center md:justify-start text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <Info className="h-3 w-3" />
                            {t('PortionResultCard.gi_source_note')}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        )}

        {/* Hand Model Section */}
        {result.handPortions && result.handPortions.length > 0 && (
          <div className="bg-secondary/20 p-6 rounded-[2.5rem] border border-primary/10 space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Hand className="h-6 w-6" />
              <h4 className="font-bold text-xl">{t('NutritionResultCard.handEstimationTitle')}</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.handPortions.map((portion, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {t(`PortionTypes.${portion.type}`)}
                  </span>
                  <span className="text-4xl font-black text-primary">x{portion.count}</span>
                  <span className="text-sm italic text-foreground/70 leading-tight font-medium">
                    {portion.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 pt-4 text-[11px] text-muted-foreground leading-relaxed border-t border-primary/5">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary/40" />
              <p>{t('NutritionResultCard.handMethodNote')}</p>
            </div>
          </div>
        )}

        {/* Reasoning and Nutrient Table */}
        <div className="space-y-6">
          <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex gap-4">
            <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <p className="text-base italic text-foreground/80 leading-relaxed">
              "{result.reasoning}"
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-xl flex items-center gap-2 text-primary/90">
              <Utensils className="h-5 w-5" />
              {t('NutritionResultCard.nutrient')}
            </h4>
            <NutrientTable 
              nutrients={result.nutrients} 
              amountHeader={t('PortionResultCard.amountTotal')}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 border-t p-8">
        <Button onClick={handleLog} disabled={isRecalculating} className="w-full h-16 text-xl bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-2xl shadow-lg transition-all hover:scale-[1.01]">
          {t('NutritionResultCard.logFoodButton').toUpperCase()}
        </Button>
      </CardFooter>
    </Card>
  );
}
