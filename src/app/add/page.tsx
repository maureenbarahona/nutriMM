import { ManualEntryForm } from "@/components/manual-entry-form";

export default function AddPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 max-w-2xl mx-auto">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
                    Add Food Manually
                </h1>
                <p className="text-lg text-foreground/80">
                    Know the nutritional info? Log your food directly here. Perfect for items with a nutrition label.
                </p>
            </div>
            <ManualEntryForm />
        </div>
    );
}
