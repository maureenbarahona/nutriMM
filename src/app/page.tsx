import { ScanForm } from '@/components/scan-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
            Snap. Analyze. Thrive.
          </h1>
          <p className="text-lg text-foreground/80 mb-8">
            Instantly discover the nutritional value of your meals. Just take a picture and let NutriSnap do the rest.
          </p>
          <ScanForm />
        </div>
        <div className="lg:col-span-2 hidden lg:block">
          {heroImage && (
            <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                sizes="(max-width: 1024px) 0, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white">Eat Smarter, Live Better.</h3>
                <p className="text-white/90 mt-1">Your journey to mindful eating starts here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
