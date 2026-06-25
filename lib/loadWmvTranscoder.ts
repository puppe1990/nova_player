import type { WmvTranscoder } from './wmvTranscoder';

let transcoderPromise: Promise<WmvTranscoder> | null = null;

export async function loadWmvTranscoder(): Promise<WmvTranscoder> {
  if (!transcoderPromise) {
    transcoderPromise = import('./ffmpegWmvTranscoder').then(
      ({ FfmpegWmvTranscoder }) => new FfmpegWmvTranscoder(),
    );
  }
  return transcoderPromise;
}
