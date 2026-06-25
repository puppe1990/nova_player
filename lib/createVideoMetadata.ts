import type { VideoMetadata } from '../types';

export function createVideoMetadata(
  file: File,
  playbackUrl: string,
  playbackType: string,
): VideoMetadata {
  return {
    name: file.name,
    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    type: playbackType,
    url: playbackUrl,
  };
}
