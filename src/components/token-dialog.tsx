'use client';

import { useState } from 'react';
import { useToken } from '@/context/token-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, CheckCircle2, XCircle } from 'lucide-react';
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
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline">
            {t('TokenDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isAuthorized 
              ? t('TokenDialog.alreadyAuthorized')
              : t('TokenDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        {!isAuthorized && (
          <div className="grid gap-4 py-4">
            <Input
              placeholder={t('TokenDialog.placeholder')}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              className="text-center uppercase tracking-widest font-bold"
            />
          </div>
        )}

        <DialogFooter>
          {isAuthorized ? (
             <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('TokenDialog.successTitle')}
             </Button>
          ) : (
            <Button onClick={handleValidate} className="w-full font-bold">
              {t('TokenDialog.submit')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
