
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, PlusCircle, Scale, Calculator, KeyRound, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './icons';
import { useLanguage } from '@/context/language-context';
import { useToken } from '@/context/token-context';
import { LanguageSwitcher } from './language-switcher';
import { SiteFooter } from './site-footer';
import { TokenDialog } from './token-dialog';
import { useState, useEffect } from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAuthorized } = useToken();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/scan', label: t('Navigation.scan'), icon: Camera, hidden: false },
    { href: '/add', label: t('Navigation.addManually'), icon: PlusCircle, hidden: false },
    { href: '/portions', label: t('Navigation.portions'), icon: Scale, hidden: !isAuthorized },
    { href: '/bmi', label: t('Navigation.bmi'), icon: Calculator, hidden: !isAuthorized },
    { href: '/history', label: t('Navigation.history'), icon: History, hidden: false },
  ];

  const visibleItems = navItems.filter(item => !item.hidden);

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
              {mounted && visibleItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors whitespace-nowrap',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <TokenDialog>
                 <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                   <KeyRound className="h-4 w-4" />
                   {t('Navigation.token')}
                 </button>
              </TokenDialog>
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
        <nav className={cn(
          "container mx-auto grid items-center justify-items-center gap-1 px-2 py-2",
          visibleItems.length + 1 === 6 ? "grid-cols-6" : visibleItems.length + 1 === 5 ? "grid-cols-5" : "grid-cols-4"
        )}>
          {mounted && visibleItems.map((item) => {
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
                <span className="truncate w-full px-1">{item.label}</span>
              </Link>
            );
          })}
          <TokenDialog>
             <button className="flex flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium text-muted-foreground hover:text-foreground text-center">
               <KeyRound className="h-5 w-5" />
               <span>{t('Navigation.token')}</span>
             </button>
          </TokenDialog>
        </nav>
      </footer>
    </>
  );
}
