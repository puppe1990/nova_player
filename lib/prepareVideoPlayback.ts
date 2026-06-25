import { needsBrowserTranscode } from './mediaFile';
import { loadWmvTranscoder } from './loadWmvTranscoder';
import type { WmvTranscoder } from './wmvTranscoder';

export interface VideoPlaybackSource {
  url: string;
  type: string;
}

export async function prepareVideoPlayback(
  file: File,
  onProgress?: (ratio: number) => void,
  transcoderLoader: () => Promise<WmvTranscoder> = loadWmvTranscoder,
): Promise<VideoPlaybackSource> {
  if (!needsBrowserTranscode(file)) {
    return {
      url: URL.createObjectURL(file),
      type: file.type || 'video/mp4',
    };
  }

  const transcoder = await transcoderLoader();
  const mp4Blob = await transcoder.transcodeToMp4(file, onProgress);
  return {
    url: URL.createObjectURL(mp4Blob),
    type: 'video/mp4',
  };
}
