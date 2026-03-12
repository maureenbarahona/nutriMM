
'use client';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { ArrowRight, Sparkles, Cloud, Brain, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const maureenImage = PlaceHolderImages.find((img) => img.id === 'maureen-portrait');
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium text-sm border border-primary/20">
                {t('LandingPage.preTitle')}
              </div>
              <h1 className="font-headline text-5xl lg:text-7xl font-bold text-foreground leading-[1.1]">
                {t('LandingPage.title')}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                {t('LandingPage.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                  <Link href="/scan">
                    {t('LandingPage.cta')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
              {maureenImage && (
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group bg-muted">
                  <Image
                    src={maureenImage.imageUrl}
                    alt={maureenImage.description}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint={maureenImage.imageHint}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                      <p className="text-white font-medium italic text-sm md:text-base">"Fusionando tecnología y nutrición por un mundo más saludable."</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </section>

      {/* About the Creator Section */}
      <section className="py-24 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold font-headline text-primary">
                {t('LandingPage.creatorTitle')}
              </h2>
              <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                  <p className="text-xl leading-relaxed text-foreground font-medium">
                    {t('LandingPage.creatorText1')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/10 rounded-[2rem]">
                <CardContent className="p-8 space-y-6">
                  <p className="text-lg leading-relaxed text-muted-foreground italic">
                    {t('LandingPage.creatorText2')}
                  </p>
                  <div className="flex gap-4 pt-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                      <Cloud className="h-6 w-6" />
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-accent">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-green-500">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features quick look */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center space-y-16">
          <h3 className="text-3xl font-bold font-headline tracking-tight">¿Qué puedes hacer hoy?</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: t('Navigation.scan'), desc: "Análisis instantáneo de alimentos por fotografía.", href: "/scan" },
              { icon: Activity, title: t('Navigation.bmi'), desc: "Estado nutricional y requerimientos calóricos personalizados.", href: "/bmi" },
              { icon: ArrowRight, title: t('Navigation.history'), desc: "Seguimiento diario de tu progreso e ingesta.", href: "/history" }
            ].map((feature, i) => (
              <Link key={i} href={feature.href} className="group p-8 bg-background border rounded-[2rem] hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
