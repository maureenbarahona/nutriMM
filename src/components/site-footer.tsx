'use client';
import Link from 'next/link';
import { Logo } from './icons';
import { useLanguage } from '@/context/language-context';
import { useState, useEffect } from 'react';

export function SiteFooter() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const footerLinks = [
        { href: '/', label: t('Navigation.scan') },
        { href: '/add', label: t('Navigation.addManually') },
        { href: '/portions', label: t('Navigation.portions') },
        { href: '/bmi', label: t('Navigation.bmi') },
        { href: '/history', label: t('Navigation.history') },
    ];

    return (
        <footer className="bg-muted/50 text-muted-foreground pb-20 md:pb-10">
            <div className="container py-10 px-5">
                <div className="flex flex-wrap justify-between gap-8">
                    
                    <div className="flex-1 min-w-[250px] mb-5">
                        <Link href="/" className="flex items-center gap-2 mb-2">
                            <Logo className="h-8 w-8 text-primary" />
                            <span className="font-headline text-xl font-bold text-foreground">Nutri MyM</span>
                        </Link>
                        <p className="text-sm">Tu aliado en nutrición y salud personalizada.</p>
                    </div>

                    <div className="flex-1 min-w-[150px] mb-5">
                        <h4 className="font-semibold mb-2 text-foreground">Explorar</h4>
                        <ul className="space-y-2 text-sm">
                            {mounted && footerLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 min-w-[150px] mb-5">
                        <h4 className="font-semibold mb-2 text-foreground">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Términos</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-5 pt-5 text-center text-sm">
                    <p>&copy; 2026 <strong className="font-semibold">Nutri MyM</strong>. Todos los derechos reservados.</p>
                    <p>Sitio web creado por <a href="http://maureenbarahona.foo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Maureen Barahona</a></p>
                </div>
            </div>
        </footer>
    );
}
