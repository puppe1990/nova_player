import { describe, it, expect } from 'vitest';
import {
  isVideoFile,
  isMediaFile,
  SUPPORTED_VIDEO_FORMATS_LABEL,
} from './mediaFile';

function createFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

describe('isVideoFile', () => {
  it('accepts WMV with video/x-ms-wmv MIME type', () => {
    const file = createFile('clip.wmv', 'video/x-ms-wmv');
    expect(isVideoFile(file)).toBe(true);
  });

  it('accepts WMV with application/x-ms-wmv MIME type', () => {
    const file = createFile('clip.wmv', 'application/x-ms-wmv');
    expect(isVideoFile(file)).toBe(true);
  });

  it('accepts WMV by .wmv extension when MIME type is empty', () => {
    const file = createFile('clip.wmv', '');
    expect(isVideoFile(file)).toBe(true);
  });

  it('accepts WMV by .WMV extension case-insensitively', () => {
    const file = createFile('CLIP.WMV', '');
    expect(isVideoFile(file)).toBe(true);
  });

  it('rejects non-video files without WMV extension', () => {
    const file = createFile('readme.txt', 'text/plain');
    expect(isVideoFile(file)).toBe(false);
  });
});

describe('isMediaFile', () => {
  it('treats WMV with empty MIME as media', () => {
    const file = createFile('clip.wmv', '');
    expect(isMediaFile(file)).toBe(true);
  });
});

describe('SUPPORTED_VIDEO_FORMATS_LABEL', () => {
  it('includes WMV in the supported formats list', () => {
    expect(SUPPORTED_VIDEO_FORMATS_LABEL).toMatch(/WMV/i);
  });
});
