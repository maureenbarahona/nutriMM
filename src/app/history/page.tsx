import { HistoryClientPage } from "@/components/history-client-page";

export default function HistoryPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
                    Food History
                </h1>
                <p className="text-lg text-foreground/80">
                    Review your logged meals and track your daily progress.
                </p>
            </div>
            <HistoryClientPage />
        </div>
    );
}
