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
  state,
  onFileSelect,
  previewUrl,
  selectedFile,
}: {
  state: AnalysisState;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  selectedFile: File | null;
}) {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <>
      <FileUploader onFileSelect={onFileSelect} previewUrl={previewUrl} disabled={pending} />
      {selectedFile && <input type="hidden" name="image" value={previewUrl ?? ''} />}
      {selectedFile && (
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      )}

      {pending && (
        <div className="mt-6 space-y-4 animate-pulse">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      )}

      {state.status === 'error' && state.message && !pending && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{t('ScanForm.errorTitle')}</AlertTitle>
          <AlertDescription>{t(state.message, state.messageValues)}</AlertDescription>
        </Alert>
      )}

      {state.status === 'success' && state.data && !pending && (
        <div className="mt-6">
          <NutritionResultCard analysis={state.data} />
        </div>
      )}
    </>
  );
}

export function ScanForm() {
  const [state, formAction] = useActionState(analyzeImageAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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
    const dataUri = await fileToDataUri(file, { maxSizeMB: 0.7 });
    setPreviewUrl(dataUri);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} action={formAction} className="space-y-6">
          <FormContent
            state={state}
            onFileSelect={handleFileSelect}
            previewUrl={previewUrl}
            selectedFile={selectedFile}
          />
        </form>
      </CardContent>
    </Card>
  );
}
