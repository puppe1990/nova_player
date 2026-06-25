import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { WmvTranscoder } from './wmvTranscoder';

const CORE_VERSION = '0.12.10';

function fileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return '.bin';
  return fileName.slice(dotIndex).toLowerCase();
}

export class FfmpegWmvTranscoder implements WmvTranscoder {
  private ffmpeg = new FFmpeg();
  private loadPromise: Promise<void> | null = null;

  private async ensureLoaded(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = this.loadFfmpeg();
    }
    await this.loadPromise;
  }

  private async loadFfmpeg(): Promise<void> {
    const baseURL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    });
  }

  async transcodeToMp4(
    file: File,
    onProgress?: (ratio: number) => void,
  ): Promise<Blob> {
    await this.ensureLoaded();

    if (onProgress) {
      this.ffmpeg.on('progress', ({ progress }) => onProgress(progress));
    }

    const inputName = `input${fileExtension(file.name)}`;
    const outputName = 'output.mp4';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));
    const exitCode = await this.ffmpeg.exec([
      '-i',
      inputName,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '28',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error(
        `Video transcode failed for "${file.name}" with exit code ${exitCode}`,
      );
    }

    const data = await this.ffmpeg.readFile(outputName);
    await this.ffmpeg.deleteFile(inputName);
    await this.ffmpeg.deleteFile(outputName);

    const bytes =
      data instanceof Uint8Array
        ? data
        : new TextEncoder().encode(String(data));

    return new Blob([bytes], { type: 'video/mp4' });
  }
}
