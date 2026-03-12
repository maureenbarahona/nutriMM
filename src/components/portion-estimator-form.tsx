'use client';

import { useActionState, useState, useEffect } from 'react';
import { Sparkles, Scale, Loader2 } from 'lucide-react';
import { estimatePortionsAction, type AnalysisState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { PortionResultCard } from './portion-result-card';
import { Skeleton } from './ui/skeleton';
import { fileToDataUri } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const initialState: AnalysisState = {
  status: 'error',
  message: '',
};

export function PortionEstimatorForm() {
  const [state, formAction, isPending] = useActionState(estimatePortionsAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { toast } = useToast();
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: t('ScanForm.analysisFailedTitle'),
        description: t(state.message, state.messageValues),
      });
    }
  }, [state, toast, t]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setPreviewUrl(null); // Clear previous while processing
    try {
      const dataUri = await fileToDataUri(file, { maxSizeMB: 0.7 });
      setPreviewUrl(dataUri);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        variant: 'destructive',
        title: t('ScanForm.errorTitle'),
        description: t('Actions.unexpectedError'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const showSubmit = previewUrl && !isPending && !isProcessing;

  return (
    <div className="space-y-8">
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-6">
            <div className="relative">
              <FileUploader onFileSelect={handleFileSelect} previewUrl={previewUrl} disabled={isPending || isProcessing} />
              
              {state.status === 'error' && state.message && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20 max-w-[200px] animate-in fade-in zoom-in duration-300">
                   <Alert variant="destructive" className="shadow-xl border-2">
                    <AlertTitle className="text-xs font-bold">{t('ScanForm.errorTitle')}</AlertTitle>
                    <AlertDescription className="text-[10px] leading-tight">
                      {t(state.message, state.messageValues)}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {/* Hidden inputs always present when submission is possible */}
            <input type="hidden" name="image" value={previewUrl || ''} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="latitude" value={location?.latitude?.toString() || ''} />
            <input type="hidden" name="longitude" value={location?.longitude?.toString() || ''} />
            
            {isProcessing && (
              <Button disabled className="w-full h-12 bg-muted text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {locale === 'es' ? 'Procesando imagen...' : 'Processing image...'}
              </Button>
            )}

            {showSubmit && (
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold tracking-wider uppercase h-12">
                <Scale className="mr-2 h-5 w-5" />
                {t('PortionEstimator.analyzeButton')}
              </Button>
            )}

            {isPending && (
              <div className="space-y-4">
                <Button disabled className="w-full h-12">
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  {t('PortionEstimator.analyzingButton')}
                </Button>
                <div className="space-y-2 animate-pulse">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {state.status === 'success' && state.data && (
        <PortionResultCard 
          result={state.data} 
          originalImage={previewUrl} 
          location={location}
        />
      )}
    </div>
  );
}
