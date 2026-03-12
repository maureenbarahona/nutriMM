
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, PlusCircle, Scale, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './icons';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from './language-switcher';
import { SiteFooter } from './site-footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t('Navigation.scan'), icon: Home },
    { href: '/add', label: t('Navigation.addManually'), icon: PlusCircle },
    { href: '/portions', label: t('Navigation.portions'), icon: Scale },
    { href: '/bmi', label: t('Navigation.bmi'), icon: Calculator },
    { href: '/history', label: t('Navigation.history'), icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold">{t('NutriMM.title')}</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex md:items-center md:gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <footer className="sticky bottom-0 z-40 w-full border-t bg-background/95 md:hidden">
        <nav className="container mx-auto grid grid-cols-5 items-center justify-items-center gap-1 px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium transition-colors text-center',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </footer>
    </>
  );
}
