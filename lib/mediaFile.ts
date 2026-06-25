export const SUPPORTED_VIDEO_FORMATS_LABEL = 'MP4, MKV, WebM, WMV, MPG';

export const FILE_INPUT_ACCEPT = 'video/*,audio/*,.wmv,.mpg,.mpeg';

const WMV_MIME_TYPES = new Set(['video/x-ms-wmv', 'application/x-ms-wmv']);
const MPG_MIME_TYPES = new Set(['video/mpeg', 'video/mpg']);

function hasWmvExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.wmv');
}

function hasMpgExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.mpg') || lower.endsWith('.mpeg');
}

export function isWmvFile(file: File): boolean {
  if (WMV_MIME_TYPES.has(file.type)) return true;
  return hasWmvExtension(file.name);
}

export function isMpgFile(file: File): boolean {
  if (MPG_MIME_TYPES.has(file.type)) return true;
  return hasMpgExtension(file.name);
}

export function needsBrowserTranscode(file: File): boolean {
  return isWmvFile(file) || isMpgFile(file);
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true;
  if (isWmvFile(file)) return true;
  if (isMpgFile(file)) return true;
  return false;
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

export function isMediaFile(file: File): boolean {
  return isVideoFile(file) || isAudioFile(file);
}
