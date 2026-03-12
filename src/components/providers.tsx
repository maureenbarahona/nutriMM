'use client';

import { LanguageProvider } from "@/context/language-context";
import { TokenProvider } from "@/context/token-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <TokenProvider>
                {children}
            </TokenProvider>
        </LanguageProvider>
    );
}
