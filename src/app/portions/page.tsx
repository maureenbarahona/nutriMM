'use client';
import { PortionEstimatorForm } from "@/components/portion-estimator-form";
import { useLanguage } from "@/context/language-context";
import { Scale, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PortionsPage() {
    const { t } = useLanguage();
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mb-4">
                        <Scale className="h-10 w-10" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                        {t('PortionsPage.title')}
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        {t('PortionsPage.subtitle')}
                    </p>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
                        <div className="text-sm text-blue-800">
                            <strong>{t('PortionsPage.methodTitle')}</strong>: {t('PortionsPage.methodDescription')}
                        </div>
                    </CardContent>
                </Card>

                <PortionEstimatorForm />
            </div>
        </div>
    );
}
