'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TokenContextType = {
  isAuthorized: boolean;
  authorize: (token: string) => boolean;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutrimm-auth');
    if (saved === 'true') {
      setIsAuthorized(true);
    }
    setMounted(true);
  }, []);

  const authorize = (token: string) => {
    if (token.toUpperCase() === 'AGUACATE') {
      setIsAuthorized(true);
      localStorage.setItem('nutrimm-auth', 'true');
      return true;
    }
    return false;
  };

  if (!mounted) return null;

  return (
    <TokenContext.Provider value={{ isAuthorized, authorize }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
}
