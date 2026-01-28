'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef, useActionState } from 'react';
import { Camera, Sparkles } from 'lucide-react';

import { analyzeImageAction, type AnalysisState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { NutritionResultCard } from './nutrition-result-card';
import { Skeleton } from './ui/skeleton';
import { fileToDataUri } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useLanguage } from '@/context/language-context';

const initialState: AnalysisState = {
  status: 'error',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          {t('ScanForm.analyzingButton')}
        </>
      ) : (
        <>
          <Camera className="mr-2 h-4 w-4" />
          {t('ScanForm.analyzeButton')}
        </>
      )}
    </Button>
  );
}

function FormContent({
  onFileSelect,
  previewUrl,
  selectedFile,
  location,
}: {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  selectedFile: File | null;
  location: { latitude: number; longitude: number } | null;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <FileUploader onFileSelect={onFileSelect} previewUrl={previewUrl} disabled={pending} />
      {selectedFile && <input type="hidden" name="image" value={previewUrl ?? ''} />}
      {location && (
        <>
            <input type="hidden" name="latitude" value={location.latitude} />
            <input type="hidden" name="longitude" value={location.longitude} />
        </>
      )}
      {selectedFile && !pending && (
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      )}

      {pending && (
        <div className="mt-6 space-y-4">
            <div className="flex justify-end">
                <SubmitButton />
            </div>
            <div className="space-y-4 animate-pulse">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                </div>
            </div>
        </div>
      )}
    </>
  );
}

export function ScanForm() {
  const [state, formAction] = useActionState(analyzeImageAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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
    if (state.status === 'success' && state.message && state.data) {
      toast({
        title: t(state.message),
        description: `${state.data.foodItem} analyzed.`,
      });
    }
  }, [state, toast, t]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    // Reset state when a new file is selected
    formRef.current?.reset();
    const dataUri = await fileToDataUri(file, { maxSizeMB: 0.7 });
    setPreviewUrl(dataUri);
  };

  const analysisData = state.status === 'success' ? state.data : null;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <form ref={formRef} action={formAction} className="space-y-6">
            <FormContent
              onFileSelect={handleFileSelect}
              previewUrl={previewUrl}
              selectedFile={selectedFile}
              location={location}
            />
          </form>
        </CardContent>
      </Card>
      
      {state.status === 'error' && state.message && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{t('ScanForm.errorTitle')}</AlertTitle>
          <AlertDescription>{t(state.message, state.messageValues)}</AlertDescription>
        </Alert>
      )}

      {analysisData && (
        <div className="mt-6">
          <NutritionResultCard analysis={analysisData} />
        </div>
      )}
    </>
  );
}
