'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FoodLogItem, Nutrient } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

const STORAGE_KEY = 'nutrisnap-food-log';

export function useFoodLog() {
  const [log, setLog] = useState<FoodLogItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const itemsJSON = window.localStorage.getItem(STORAGE_KEY);
      if (itemsJSON) {
        const items = JSON.parse(itemsJSON);
        // Basic validation
        if (Array.isArray(items)) {
          setLog(items);
        }
      }
    } catch (error) {
      console.error('Failed to load food log from localStorage', error);
    }
    setIsLoaded(true);
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
      } catch (error) {
        console.error('Failed to save food log to localStorage', error);
      }
    }
  }, [log, isLoaded, toast]);

  const addFoodItem = useCallback(
    (item: { name: string; quantity: number; nutrients: Nutrient[] }) => {
      const newItem: FoodLogItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setLog((prevLog) => [newItem, ...prevLog]);
    },
    []
  );
  
  const removeFoodItem = useCallback((id: string) => {
    setLog(prevLog => prevLog.filter(item => item.id !== id));
  }, []);

  return { log, addFoodItem, removeFoodItem, isLoaded };
}
