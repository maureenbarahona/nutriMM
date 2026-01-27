'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FoodLogItem, Nutrient } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'nutrisnap-food-log';

export function useFoodLog() {
  const [log, setLog] = useState<FoodLogItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('FoodLog');

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
        description: t('loadError'),
      });
    }
    setIsLoaded(true);
  }, [toast, t]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
      } catch (error) {
        console.error('Failed to save food log to localStorage', error);
        toast({
          variant: 'destructive',
          title: 'Error',
        description: t('saveError'),
        });
      }
    }
  }, [log, isLoaded, toast, t]);

  const addFoodItem = useCallback(
    (item: { name: string; quantity: number; nutrients: Nutrient[] }) => {
      const newItem: FoodLogItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setLog((prevLog) => [newItem, ...prevLog]);
      toast({
        title: t('loggedToastTitle'),
        description: t('loggedToastDescription', {quantity: item.quantity, name: item.name}),
      });
    },
    [toast, t]
  );
  
  const removeFoodItem = useCallback((id: string) => {
    setLog(prevLog => prevLog.filter(item => item.id !== id));
    toast({
        title: t('removedToastTitle'),
        description: t('removedToastDescription')
    })
  }, [toast, t]);

  return { log, addFoodItem, removeFoodItem, isLoaded };
}
