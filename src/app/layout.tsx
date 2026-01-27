import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/main-layout';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'NutriM&M',
  description: 'Snap a photo of your food and get its nutritional value instantly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <Providers>
            <MainLayout>{children}</MainLayout>
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
