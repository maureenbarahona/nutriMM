import Link from 'next/link';
import { Logo } from './icons';

export function SiteFooter() {
    return (
        <footer className="bg-muted/50 text-muted-foreground">
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
                            <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">Sobre nosotros</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contacto</Link></li>
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
