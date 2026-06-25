export const SUPPORTED_VIDEO_FORMATS_LABEL = 'MP4, MKV, WebM, WMV';

const WMV_MIME_TYPES = new Set(['video/x-ms-wmv', 'application/x-ms-wmv']);

function hasWmvExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.wmv');
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true;
  if (WMV_MIME_TYPES.has(file.type)) return true;
  if (file.type === '' && hasWmvExtension(file.name)) return true;
  return false;
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

export function isMediaFile(file: File): boolean {
  return isVideoFile(file) || isAudioFile(file);
}
