'use client';

import { useState } from 'react';
import { useToken } from '@/context/token-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TokenDialog({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');
  const [open, setOpen] = useState(false);
  const { authorize, isAuthorized } = useToken();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleValidate = () => {
    if (!token.trim()) {
        toast({
            variant: 'destructive',
            title: t('TokenDialog.errorTitle'),
            description: t('Actions.foodNameRequired'), // Reutilizando llave o podrías crear una nueva
        });
        return;
    }

    const success = authorize(token);
    if (success) {
      toast({
        title: t('TokenDialog.successTitle'),
        description: t('TokenDialog.successDescription'),
      });
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: t('TokenDialog.errorTitle'),
        description: t('TokenDialog.invalidToken'),
      });
    }
    setToken('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline">
            {t('TokenDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {isAuthorized 
              ? t('TokenDialog.alreadyAuthorized')
              : t('TokenDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        {!isAuthorized ? (
          <div className="space-y-6 py-6">
            <div className="space-y-2">
                <Input
                  placeholder={t('TokenDialog.placeholder')}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                  className="text-center uppercase tracking-widest font-bold h-12 text-lg border-2 focus-visible:ring-primary"
                  autoFocus
                />
            </div>
            <Button onClick={handleValidate} className="w-full h-12 font-bold text-lg bg-primary hover:bg-primary/90">
              {t('TokenDialog.submit')}
            </Button>
          </div>
        ) : (
          <div className="py-8">
            <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-lg cursor-default" disabled>
                <CheckCircle2 className="mr-3 h-6 w-6" />
                {t('TokenDialog.successTitle').toUpperCase()}
            </Button>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
            <p className="text-[10px] text-muted-foreground text-center italic">
                NutriM&M Security System v1.0
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
