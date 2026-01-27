'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Camera, Sparkles } from 'lucide-react';

import { analyzeImageAction, type AnalysisState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploader } from './file-uploader';
import { NutritionResultCard } from './nutrition-result-card';
import { Skeleton } from './ui/skeleton';
import { fileToDataUri } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const initialState: AnalysisState = {
  status: 'error',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Camera className="mr-2 h-4 w-4" />
          Analyze Image
        </>
      )}
    </Button>
  );
}

export function ScanForm() {
  const [state, formAction] = useFormState(analyzeImageAction, initialState);
  const { pending } = useFormStatus();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const dataUri = await fileToDataUri(file);
    setPreviewUrl(dataUri);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} action={formAction} className="space-y-6">
          <FileUploader onFileSelect={handleFileSelect} previewUrl={previewUrl} disabled={pending} />
          {selectedFile && <input type="hidden" name="image" value={previewUrl ?? ''} />}
          {selectedFile && (
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          )}
        </form>

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
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}

        {state.status === 'success' && state.data && !pending && (
          <div className="mt-6">
            <NutritionResultCard analysis={state.data} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
