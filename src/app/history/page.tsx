import { HistoryClientPage } from "@/components/history-client-page";
import { useTranslations } from "next-intl";

export default function HistoryPage() {
    const t = useTranslations('HistoryPage');
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
                    {t('title')}
                </h1>
                <p className="text-lg text-foreground/80">
                    {t('subtitle')}
                </p>
            </div>
            <HistoryClientPage />
        </div>
    );
}
