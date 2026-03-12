
'use client';
import { BMICalculator } from "@/components/bmi-calculator";
import { useLanguage } from "@/context/language-context";
import { Calculator, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BMIPage() {
    const { t } = useLanguage();
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mb-4">
                        <Calculator className="h-10 w-10" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                        {t('BMIPage.title')}
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        {t('BMIPage.subtitle')}
                    </p>
                </div>

                <Card className="bg-secondary/50 border-primary/20 shadow-none">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <div className="text-sm">
                            <span className="text-foreground/80">{t('BMIPage.ageWarning')}</span>
                        </div>
                    </CardContent>
                </Card>

                <BMICalculator />
            </div>
        </div>
    );
}
