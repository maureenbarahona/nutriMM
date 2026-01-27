'use client'; // convert to client component

import { ScanForm } from '@/components/scan-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
            {t('HomePage.title')}
          </h1>
          <p className="text-lg text-foreground/80 mb-8">
            {t('HomePage.subtitle')}
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
                <h3 className="text-2xl font-bold text-white">{t('HomePage.cardTitle')}</h3>
                <p className="text-white/90 mt-1">{t('HomePage.cardSubtitle')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
