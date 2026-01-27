import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/main-layout';
import { NextIntlClientProvider, useMessages } from 'next-intl';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    const getMessage = (key: string) => {
        const keys = key.split('.');
        let result: any = messages;
        for (const k of keys) {
            result = result[k];
            if (result === undefined) return key;
        }
        return result;
    };
    
    return {
      title: getMessage('NutriSnap.title'),
      description: getMessage('NutriSnap.description'),
    }
  } catch (error) {
    console.error("Could not load messages for metadata", error);
    return {
      title: 'NutriSnap',
      description: 'Snap a photo of your food and get its nutritional value instantly.',
    };
  }
}

export default function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = useMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <MainLayout>{children}</MainLayout>
            <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
