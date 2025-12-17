export interface ImageState {
  original: string | null;
  processed: string | null;
  backgroundRemoved: string | null;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'color' | 'image' | 'transparent';
  value: string;
  thumbnail: string;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}