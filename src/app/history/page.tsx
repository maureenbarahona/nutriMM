'use client';
import { HistoryClientPage } from "@/components/history-client-page";
import { useLanguage } from "@/context/language-context";

export default function HistoryPage() {
    const { t } = useLanguage();
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
                    {t('HistoryPage.title')}
                </h1>
                <p className="text-lg text-foreground/80">
                    {t('HistoryPage.subtitle')}
                </p>
            </div>
            <HistoryClientPage />
        </div>
    );
}
