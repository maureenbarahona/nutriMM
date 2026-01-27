'use client';

import { format, parseISO, isSameDay } from 'date-fns';
import type { FoodLogItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { getNutrientIcon } from '@/lib/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface HistoryListProps {
  log: FoodLogItem[];
  onRemove: (id: string) => void;
}

export function HistoryList({ log, onRemove }: HistoryListProps) {
  const groupedLog = log.reduce((acc, item) => {
    const date = format(parseISO(item.createdAt), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, FoodLogItem[]>);

  const sortedDates = Object.keys(groupedLog).sort((a, b) => b.localeCompare(a));
  
  const formatDateHeading = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isSameDay(date, new Date())) {
      return 'Today';
    }
    return format(date, 'MMMM d, yyyy');
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-headline">Logged Items</h2>
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">{formatDateHeading(date)}</h3>
          <div className="space-y-4">
            {groupedLog[date].map((item) => (
              <Card key={item.id}>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="p-4">
                            <div className="flex justify-between items-center w-full">
                                <div className="text-left">
                                    <p className="font-bold text-lg text-primary">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.quantity}g - {format(parseISO(item.createdAt), 'p')}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                            <div className="space-y-3">
                                {item.nutrients.slice(0, 4).map(n => {
                                    const Icon = getNutrientIcon(n.name);
                                    return (
                                        <div key={n.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4"/> {n.name}</span>
                                            <span className="font-medium">{n.amount.toLocaleString()} {n.unit}</span>
                                        </div>
                                    )
                                })}
                                <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive mt-2" onClick={() => onRemove(item.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
