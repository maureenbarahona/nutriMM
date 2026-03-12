'use client';
import { PortionEstimatorForm } from "@/components/portion-estimator-form";
import { useLanguage } from "@/context/language-context";
import { Flame, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PortionsPage() {
    const { t } = useLanguage();
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mb-4">
                        <Flame className="h-10 w-10" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                        {t('PortionsPage.title')}
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                        {t('PortionsPage.subtitle')}
                    </p>
                </div>

                <Card className="bg-primary/10 border-primary/20 shadow-none border">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary shrink-0" />
                        <div className="text-sm">
                            <strong className="text-primary font-bold">{t('PortionsPage.methodTitle')}</strong> - <span className="text-foreground/80">{t('PortionsPage.methodDescription')}</span>
                        </div>
                    </CardContent>
                </Card>

                <PortionEstimatorForm />
            </div>
        </div>
    );
}
