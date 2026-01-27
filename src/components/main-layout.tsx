'use client';
import Link from 'next-intl/link';
import { usePathname } from 'next-intl/client';
import { Home, History, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './icons';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const navItems = [
    { href: '/', label: t('scan'), icon: Home },
    { href: '/history', label: t('history'), icon: History },
    { href: '/add', label: t('addManually'), icon: PlusCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold">NutriSnap</span>
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
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="sticky bottom-0 z-40 w-full border-t bg-background/95 md:hidden">
        <nav className="container mx-auto grid grid-cols-3 items-center justify-items-center gap-4 px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md p-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </footer>
    </>
  );
}
