import { describe, it, expect } from 'vitest';
import {
  isVideoFile,
  isMediaFile,
  isWmvFile,
  isMpgFile,
  needsBrowserTranscode,
  SUPPORTED_VIDEO_FORMATS_LABEL,
  FILE_INPUT_ACCEPT,
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

  it('accepts MPG by .mpg extension when MIME type is empty', () => {
    const file = createFile('clip.mpg', '');
    expect(isVideoFile(file)).toBe(true);
  });

  it('accepts MPEG by .mpeg extension when MIME type is empty', () => {
    const file = createFile('clip.mpeg', '');
    expect(isVideoFile(file)).toBe(true);
  });

  it('rejects non-video files without WMV extension', () => {
    const file = createFile('readme.txt', 'text/plain');
    expect(isVideoFile(file)).toBe(false);
  });
});

describe('isWmvFile', () => {
  it('detects WMV by extension when MIME is empty', () => {
    const file = createFile('clip.wmv', '');
    expect(isWmvFile(file)).toBe(true);
  });

  it('detects WMV by video/x-ms-wmv MIME type', () => {
    const file = createFile('clip.wmv', 'video/x-ms-wmv');
    expect(isWmvFile(file)).toBe(true);
  });

  it('does not treat MP4 as WMV', () => {
    const file = createFile('movie.mp4', 'video/mp4');
    expect(isWmvFile(file)).toBe(false);
  });
});

describe('isMpgFile', () => {
  it('detects MPG by extension when MIME is empty', () => {
    const file = createFile('clip.mpg', '');
    expect(isMpgFile(file)).toBe(true);
  });

  it('detects MPEG by .mpeg extension case-insensitively', () => {
    const file = createFile('CLIP.MPEG', '');
    expect(isMpgFile(file)).toBe(true);
  });

  it('detects MPG by video/mpeg MIME type', () => {
    const file = createFile('clip.mpg', 'video/mpeg');
    expect(isMpgFile(file)).toBe(true);
  });

  it('does not treat MP4 as MPG', () => {
    const file = createFile('movie.mp4', 'video/mp4');
    expect(isMpgFile(file)).toBe(false);
  });
});

describe('needsBrowserTranscode', () => {
  it('returns true for WMV files', () => {
    expect(needsBrowserTranscode(createFile('clip.wmv', ''))).toBe(true);
  });

  it('returns true for MPG files', () => {
    expect(needsBrowserTranscode(createFile('clip.mpg', ''))).toBe(true);
  });

  it('returns false for MP4 files', () => {
    expect(needsBrowserTranscode(createFile('movie.mp4', 'video/mp4'))).toBe(
      false,
    );
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

  it('includes MPG in the supported formats list', () => {
    expect(SUPPORTED_VIDEO_FORMATS_LABEL).toMatch(/MPG/i);
  });
});

describe('FILE_INPUT_ACCEPT', () => {
  it('includes mpg and mpeg extensions', () => {
    expect(FILE_INPUT_ACCEPT).toMatch(/\.mpg/);
    expect(FILE_INPUT_ACCEPT).toMatch(/\.mpeg/);
  });
});
