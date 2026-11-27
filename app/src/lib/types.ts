export interface Wallpaper {
  id: string;
  path: string;
  filename: string;
  title: string;
  category: string;
  categoryLabel: string;
  type: 'animated' | 'static';
  format: string;
  isVideo: boolean;
  sizeBytes?: number;
  sizeFormatted: string;
  width?: number;
  height?: number;
  resolution?: string;
  resolutionBadge?: string | null;
  rawUrl?: string;
  cdnUrl?: string;
  githubUrl?: string;
  tags: string[];
  source?: string;
  sourceRepo?: string;
}
