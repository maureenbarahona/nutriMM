'use client';
import { useState } from 'react';
import type { FoodLogItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getDailySummaryAction } from '@/app/actions';
import { useToast } from './ui/use-toast';
import { Loader2, TrendingUp } from 'lucide-react';
import { Progress } from './ui/progress';
import { useLanguage } from '@/context/language-context';

interface DailySummaryProps {
  todayLog: FoodLogItem[];
}

type SummaryData = {
    nutrient: string;
    dailyIntake: number;
    recommendedValue: number;
    percentageOfDailyValue: number;
}

export function DailySummary({ todayLog }: DailySummaryProps) {
  const [summary, setSummary] = useState<SummaryData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary(null);
    const result = await getDailySummaryAction(todayLog);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: t('DailySummary.summaryErrorTitle'),
        description: t(result.error),
      });
    } else if (result.data) {
      setSummary(result.data);
    }
    setIsLoading(false);
  };

  const hasLog = todayLog.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary"/>
            {t('DailySummary.title')}
        </CardTitle>
        <CardDescription>
          {t('DailySummary.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary ? (
            <div className="space-y-4">
                {summary.map(item => (
                    <div key={item.nutrient}>
                        <div className="flex justify-between items-baseline mb-1">
                            <p className="text-sm font-medium">{item.nutrient}</p>
                            <p className="text-sm text-muted-foreground">{item.dailyIntake.toFixed(1)} / {item.recommendedValue} {item.nutrient === 'Calories' ? 'kcal' : 'g'}</p>
                        </div>
                        <Progress value={Math.min(item.percentageOfDailyValue, 100)} className="h-2"/>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>{hasLog ? t('DailySummary.hasLog') : t('DailySummary.noLog')}</p>
            </div>
        )}
      </CardContent>
      {hasLog && (
        <CardContent>
            <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('DailySummary.generateButton')}
            </Button>
        </CardContent>
      )}
    </Card>
  );
}
