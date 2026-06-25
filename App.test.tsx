import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from '@testing-library/react';
import App from './App';
import { prepareVideoPlayback } from './lib/prepareVideoPlayback';

vi.mock('./lib/prepareVideoPlayback', () => ({
  prepareVideoPlayback: vi.fn(async (file: File) => ({
    url: `blob:prepared-${file.name}`,
    type: file.name.endsWith('.wmv') ? 'video/mp4' : file.type,
  })),
}));

function createVideoFile(name: string): File {
  return new File(['video-content'], name, { type: 'video/mp4' });
}

function createAudioFile(name: string): File {
  return new File(['audio-content'], name, { type: 'audio/mpeg' });
}

function createWmvFile(name: string): File {
  return new File(['video-content'], name, { type: '' });
}

async function selectFiles(files: File[]) {
  const inputs = document.querySelectorAll('input[type="file"]');
  const input = inputs[inputs.length - 1];
  if (!input) throw new Error('No file input found');
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });

  await act(async () => {
    fireEvent.change(input);
  });
}

async function waitForVideo(name: string) {
  await waitFor(() => {
    expect(screen.getByText(name)).not.toBeNull();
  });
}

beforeEach(() => {
  vi.mocked(prepareVideoPlayback).mockImplementation(async (file: File) => ({
    url: `blob:prepared-${file.name}`,
    type: file.name.endsWith('.wmv') ? 'video/mp4' : file.type,
  }));
});

afterEach(cleanup);

describe('App multi-video', () => {
  describe('adding videos', () => {
    it('shows FileUpload when no videos are loaded', () => {
      render(<App />);
      expect(screen.getByText(/arraste/i)).not.toBeNull();
    });

    it('adds a single video and renders it in the grid', async () => {
      render(<App />);
      await selectFiles([createVideoFile('movie.mp4')]);
      await waitForVideo('movie.mp4');
    });

    it('adds a WMV file after preparing playback source', async () => {
      render(<App />);
      await selectFiles([createWmvFile('clip.wmv')]);

      await waitForVideo('clip.wmv');
      expect(prepareVideoPlayback).toHaveBeenCalled();
    });

    it('shows transcoding status while WMV is being prepared', async () => {
      vi.mocked(prepareVideoPlayback).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  url: 'blob:prepared-clip.wmv',
                  type: 'video/mp4',
                }),
              50,
            );
          }),
      );

      render(<App />);

      await act(async () => {
        const inputs = document.querySelectorAll('input[type="file"]');
        const input = inputs[inputs.length - 1];
        Object.defineProperty(input, 'files', {
          configurable: true,
          value: [createWmvFile('clip.wmv')],
        });
        fireEvent.change(input);
      });

      expect(screen.getByText(/convertendo clip\.wmv/i)).not.toBeNull();

      await waitForVideo('clip.wmv');
      expect(screen.queryByText(/convertendo clip\.wmv/i)).toBeNull();
    });

    it('adds multiple videos up to 4', async () => {
      render(<App />);
      await selectFiles([
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
        createVideoFile('d.mp4'),
      ]);

      await waitForVideo('a.mp4');
      expect(screen.getByText('b.mp4')).not.toBeNull();
      expect(screen.getByText('c.mp4')).not.toBeNull();
      expect(screen.getByText('d.mp4')).not.toBeNull();
    });

    it('caps videos at 4 when selecting more than 4', async () => {
      render(<App />);
      await selectFiles([
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
        createVideoFile('d.mp4'),
        createVideoFile('e.mp4'),
      ]);

      await waitForVideo('a.mp4');
      expect(screen.getByText('d.mp4')).not.toBeNull();
      expect(screen.queryByText('e.mp4')).toBeNull();
    });

    it('shows add-video slots when fewer than 4 videos are loaded', async () => {
      render(<App />);
      await selectFiles([createVideoFile('a.mp4')]);

      await waitFor(() => {
        expect(screen.getAllByTestId('empty-slot')).toHaveLength(3);
      });
    });
  });

  describe('removing videos', () => {
    it('removes a video by index', async () => {
      render(<App />);
      await selectFiles([createVideoFile('a.mp4'), createVideoFile('b.mp4')]);
      await waitForVideo('a.mp4');

      const removeButtons = screen.getAllByRole('button', {
        name: /^Remover a\.mp4$/i,
      });
      fireEvent.click(removeButtons[0]);

      expect(screen.queryByText('a.mp4')).toBeNull();
      expect(screen.getByText('b.mp4')).not.toBeNull();
    });

    it('shows FileUpload again after removing the last video', async () => {
      render(<App />);
      await selectFiles([createVideoFile('a.mp4')]);
      await waitForVideo('a.mp4');

      fireEvent.click(
        screen.getByRole('button', { name: /^Remover a\.mp4$/i }),
      );

      expect(screen.getByText(/arraste/i)).not.toBeNull();
    });
  });

  describe('audio support', () => {
    it('loads audio file alongside videos instead of replacing them', async () => {
      render(<App />);
      await selectFiles([
        createVideoFile('video.mp4'),
        createAudioFile('song.mp3'),
      ]);

      await waitForVideo('video.mp4');
      expect(screen.getByText('song.mp3')).not.toBeNull();
    });
  });

  describe('clear all', () => {
    it('clears all videos when header remove button is clicked', async () => {
      render(<App />);
      await selectFiles([createVideoFile('a.mp4'), createVideoFile('b.mp4')]);
      await waitForVideo('a.mp4');

      fireEvent.click(
        screen.getByRole('button', { name: /^Remover Vídeos$/i }),
      );

      expect(screen.getByText(/arraste/i)).not.toBeNull();
    });
  });
});
