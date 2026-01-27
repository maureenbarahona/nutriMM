'use client';

import { useState, useRef, type DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  disabled?: boolean;
}

export function FileUploader({ onFileSelect, previewUrl, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('ScanForm');

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow drop
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={cn(
        'relative group w-full aspect-video rounded-lg border-2 border-dashed border-border transition-all flex justify-center items-center text-center p-4',
        {
          'border-primary bg-secondary': isDragging,
          'cursor-pointer hover:border-primary/80': !disabled,
          'cursor-not-allowed bg-muted/50': disabled,
        }
      )}
      onClick={triggerFileSelect}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Selected food"
          fill
          className="object-contain rounded-md"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <UploadCloud className="h-10 w-10" />
          <p className="font-semibold">{t('uploaderHint')}</p>
          <p className="text-sm">{t('uploaderFormats')}</p>
        </div>
      )}
       {previewUrl && !disabled && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <div className="flex flex-col items-center gap-2 text-white">
                <ImageIcon className="h-10 w-10"/>
                <p>{t('changeImage')}</p>
            </div>
        </div>
       )}
    </div>
  );
}
