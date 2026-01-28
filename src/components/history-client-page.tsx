'use client';
import { DailySummary } from "@/components/daily-summary";
import { HistoryList } from "@/components/history-list";
import { useFoodLog } from "@/hooks/use-food-log";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Utensils } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";

export function HistoryClientPage() {
    const { log, removeFoodItem, isLoaded } = useFoodLog();
    const { t } = useLanguage();
    const { toast } = useToast();

    const handleRemove = (id: string) => {
        removeFoodItem(id);
        toast({
            title: t('FoodLog.removedToastTitle'),
            description: t('FoodLog.removedToastDescription')
        })
    }

    if (!isLoaded) {
        return <HistorySkeleton />;
    }

    if (log.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardHeader>
                    <div className="mx-auto bg-secondary rounded-full p-4 w-fit">
                        <Utensils className="h-12 w-12 text-primary"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-2xl">{t('HistoryPage.noHistoryTitle')}</CardTitle>
                    <CardDescription className="mt-2">{t('HistoryPage.noHistorySubtitle')}</CardDescription>
                </CardContent>
            </Card>
        )
    }

    const today = new Date().toISOString().split('T')[0];
    const todayLog = log.filter(item => item.createdAt.startsWith(today));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <HistoryList log={log} onRemove={handleRemove} />
            </div>
            <div>
                <DailySummary todayLog={todayLog} />
            </div>
        </div>
    );
}


function HistorySkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
}
