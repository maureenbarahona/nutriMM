'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { Sparkles, Scale } from 'lucide-react';
import { estimatePortionsAction, type AnalysisState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { PortionResultCard } from './portion-result-card';
import { Skeleton } from './ui/skeleton';
import { fileToDataUri } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

const initialState: AnalysisState = {
  status: 'error',
  message: '',
};

export function PortionEstimatorForm() {
  const [state, formAction, isPending] = useActionState(estimatePortionsAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    if (state.status === 'success' && state.data) {
      toast({
        title: t('PortionEstimator.success'),
        description: `${state.data.foodItem} analyzed.`,
      });
    }
  }, [state, toast, t]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const dataUri = await fileToDataUri(file, { maxSizeMB: 0.7 });
    setPreviewUrl(dataUri);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-6">
            <FileUploader onFileSelect={handleFileSelect} previewUrl={previewUrl} disabled={isPending} />
            {selectedFile && <input type="hidden" name="image" value={previewUrl ?? ''} />}
            <input type="hidden" name="locale" value={locale} />
            {location && (
              <>
                <input type="hidden" name="latitude" value={location.latitude} />
                <input type="hidden" name="longitude" value={location.longitude} />
              </>
            )}
            
            {selectedFile && !isPending && (
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <Scale className="mr-2 h-4 w-4" />
                {t('PortionEstimator.analyzeButton')}
              </Button>
            )}

            {isPending && (
              <div className="space-y-4 animate-pulse">
                <Button disabled className="w-full">
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  {t('PortionEstimator.analyzingButton')}
                </Button>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {state.status === 'success' && state.data && (
        <PortionResultCard result={state.data} />
      )}
    </div>
  );
}
