import { describe, it, expect, vi } from 'vitest';
import { prepareVideoPlayback } from './prepareVideoPlayback';
import type { WmvTranscoder } from './wmvTranscoder';

function createFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

function createFakeTranscoder(mp4Content = 'converted-mp4'): WmvTranscoder {
  return {
    transcodeToMp4: vi.fn(
      async () => new Blob([mp4Content], { type: 'video/mp4' }),
    ),
  };
}

describe('prepareVideoPlayback', () => {
  it('returns a blob URL for MP4 without transcoding', async () => {
    const file = createFile('movie.mp4', 'video/mp4');
    const transcoder = createFakeTranscoder();

    const result = await prepareVideoPlayback(
      file,
      undefined,
      async () => transcoder,
    );

    expect(result.type).toBe('video/mp4');
    expect(result.url).toMatch(/^blob:/);
    expect(transcoder.transcodeToMp4).not.toHaveBeenCalled();
  });

  it('transcodes WMV to MP4 before playback', async () => {
    const file = createFile('clip.wmv', '');
    const transcoder = createFakeTranscoder();

    const result = await prepareVideoPlayback(
      file,
      undefined,
      async () => transcoder,
    );

    expect(transcoder.transcodeToMp4).toHaveBeenCalledWith(file, undefined);
    expect(result.type).toBe('video/mp4');
    expect(result.url).toMatch(/^blob:/);
  });

  it('transcodes MPG to MP4 before playback', async () => {
    const file = createFile('clip.mpg', '');
    const transcoder = createFakeTranscoder();

    const result = await prepareVideoPlayback(
      file,
      undefined,
      async () => transcoder,
    );

    expect(transcoder.transcodeToMp4).toHaveBeenCalledWith(file, undefined);
    expect(result.type).toBe('video/mp4');
    expect(result.url).toMatch(/^blob:/);
  });

  it('forwards progress callback to the transcoder', async () => {
    const file = createFile('clip.wmv', 'video/x-ms-wmv');
    const transcoder = createFakeTranscoder();
    const onProgress = vi.fn();

    await prepareVideoPlayback(file, onProgress, async () => transcoder);

    expect(transcoder.transcodeToMp4).toHaveBeenCalledWith(file, onProgress);
  });
});
