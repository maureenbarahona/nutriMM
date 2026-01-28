import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Nutrient } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNutritionString(nutritionString: string): Nutrient[] {
  if (!nutritionString || typeof nutritionString !== 'string') return [];

  const nutrients: Nutrient[] = [];
  const seenNames = new Set<string>();
  // Regex updated to better handle special characters in nutrient names
  const regex = /([\w\s\(\).Á-ü]+?)\s*:\s*([\d,]+\.?[\d]*)\s*([a-zA-Zμg%]*)/g;
  let match;

  while ((match = regex.exec(nutritionString)) !== null) {
    const name = match[1].trim();
    // Ensure we don't add duplicate nutrients
    if (!seenNames.has(name)) {
      nutrients.push({
        name: name,
        amount: parseFloat(match[2].replace(',', '')),
        unit: match[3].trim() || 'g',
      });
      seenNames.add(name);
    }
  }
  
  // Fallback for simple comma-separated lists if regex fails
  if (nutrients.length === 0) {
    const parts = nutritionString.split(',').map(p => p.trim());
    const fallbackRegex = /([\w\s]+):\s*([\d.]+)\s*(\w*)/;
    for (const part of parts) {
      const fallbackMatch = part.match(fallbackRegex);
      if (fallbackMatch) {
        const name = fallbackMatch[1].trim();
        if (!seenNames.has(name)) {
            nutrients.push({
              name: name,
              amount: parseFloat(fallbackMatch[2]),
              unit: fallbackMatch[3].trim() || 'g',
            });
            seenNames.add(name);
        }
      }
    }
  }

  return nutrients;
}

export function fileToDataUri(file: File, options: { maxSizeMB?: number } = {}): Promise<string> {
  const { maxSizeMB } = options;
  const quality = 0.7; // Compression quality for jpeg

  if (!maxSizeMB || file.size <= maxSizeMB * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(img.src);
        return reject(new Error('Could not get canvas context'));
      }

      // Define max dimensions for the compressed image
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Get the data URL for the compressed image
      // 'image/jpeg' is good for photos and offers good compression.
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Clean up the object URL
      URL.revokeObjectURL(img.src);
      resolve(dataUrl);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(error);
    };
  });
}
