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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your food history.',
      });
    }
    setIsLoaded(true);
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
      } catch (error) {
        console.error('Failed to save food log to localStorage', error);
        toast({
          variant: 'destructive',
          title: 'Error',
        description: 'Could not save your food history.',
        });
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
      toast({
        title: 'Food Logged!',
        description: `${item.quantity}g of ${item.name} added to your history.`,
      });
    },
    [toast]
  );
  
  const removeFoodItem = useCallback((id: string) => {
    setLog(prevLog => prevLog.filter(item => item.id !== id));
    toast({
        title: 'Item Removed',
        description: 'The food item has been removed from your history.'
    })
  }, [toast]);

  return { log, addFoodItem, removeFoodItem, isLoaded };
}
