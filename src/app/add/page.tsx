import { ManualEntryForm } from "@/components/manual-entry-form";
import { useTranslations } from "next-intl";

export default function AddPage() {
    const t = useTranslations('ManualEntryPage');
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 max-w-2xl mx-auto">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
                    {t('title')}
                </h1>
                <p className="text-lg text-foreground/80">
                    {t('subtitle')}
                </p>
            </div>
            <ManualEntryForm />
        </div>
    );
}
