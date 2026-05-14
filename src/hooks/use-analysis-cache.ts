'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FoodAnalysis, Nutrient } from '@/lib/types';

const CACHE_KEY = 'nutrimm-food-analysis-cache';
const CACHE_VERSION = '1.0';

interface CachedData extends FoodAnalysis {
  cachedAt: string;
  version: string;
}

export function useAnalysisCache() {
  const [cache, setCache] = useState<Record<string, CachedData>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try {
        setCache(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar la caché de análisis:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToCache = useCallback((name: string, data: FoodAnalysis) => {
    if (!name || !data.nutrients || data.nutrients.length === 0) return;

    setCache(prev => {
      const key = name.toLowerCase().trim();
      const newData: CachedData = {
        ...data,
        cachedAt: new Date().toISOString(),
        version: CACHE_VERSION
      };
      const next = { ...prev, [key]: newData };
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getFromCache = useCallback((name: string): FoodAnalysis | null => {
    if (!name) return null;
    const key = name.toLowerCase().trim();
    const found = cache[key];
    
    if (found) {
      // Retornamos una copia sin los metadatos de caché para compatibilidad
      const { cachedAt, version, ...analysis } = found;
      return { ...analysis, isFromCache: true } as FoodAnalysis & { isFromCache: boolean };
    }
    return null;
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({});
    localStorage.removeItem(CACHE_KEY);
  }, []);

  return { getFromCache, saveToCache, isLoaded, clearCache };
}
