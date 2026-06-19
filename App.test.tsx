import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';

function createVideoFile(name: string): File {
  return new File(['video-content'], name, { type: 'video/mp4' });
}

function createAudioFile(name: string): File {
  return new File(['audio-content'], name, { type: 'audio/mpeg' });
}

function selectFiles(files: File[]) {
  const inputs = document.querySelectorAll('input[type="file"]');
  const input = inputs[inputs.length - 1];
  if (!input) throw new Error('No file input found');
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
  fireEvent.change(input);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(cleanup);

describe('App multi-video', () => {
  describe('adding videos', () => {
    it('shows FileUpload when no videos are loaded', () => {
      render(<App />);
      expect(screen.getByText(/arraste/i)).not.toBeNull();
    });

    it('adds a single video and renders it in the grid', () => {
      render(<App />);
      selectFiles([createVideoFile('movie.mp4')]);

      expect(screen.getByText('movie.mp4')).not.toBeNull();
    });

    it('adds multiple videos up to 4', () => {
      render(<App />);
      selectFiles([
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
        createVideoFile('d.mp4'),
      ]);

      expect(screen.getByText('a.mp4')).not.toBeNull();
      expect(screen.getByText('b.mp4')).not.toBeNull();
      expect(screen.getByText('c.mp4')).not.toBeNull();
      expect(screen.getByText('d.mp4')).not.toBeNull();
    });

    it('caps videos at 4 when selecting more than 4', () => {
      render(<App />);
      selectFiles([
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
        createVideoFile('d.mp4'),
        createVideoFile('e.mp4'),
      ]);

      expect(screen.getByText('a.mp4')).not.toBeNull();
      expect(screen.getByText('d.mp4')).not.toBeNull();
      expect(screen.queryByText('e.mp4')).toBeNull();
    });

    it('shows add-video slots when fewer than 4 videos are loaded', () => {
      render(<App />);
      selectFiles([createVideoFile('a.mp4')]);

      expect(screen.getAllByTestId('empty-slot')).toHaveLength(3);
    });
  });

  describe('removing videos', () => {
    it('removes a video by index', () => {
      render(<App />);
      selectFiles([createVideoFile('a.mp4'), createVideoFile('b.mp4')]);

      const removeButtons = screen.getAllByRole('button', {
        name: /^Remover a\.mp4$/i,
      });
      fireEvent.click(removeButtons[0]);

      expect(screen.queryByText('a.mp4')).toBeNull();
      expect(screen.getByText('b.mp4')).not.toBeNull();
    });

    it('shows FileUpload again after removing the last video', () => {
      render(<App />);
      selectFiles([createVideoFile('a.mp4')]);

      fireEvent.click(
        screen.getByRole('button', { name: /^Remover a\.mp4$/i }),
      );

      expect(screen.getByText(/arraste/i)).not.toBeNull();
    });
  });

  describe('audio support', () => {
    it('loads audio file alongside videos instead of replacing them', () => {
      render(<App />);
      selectFiles([createVideoFile('video.mp4'), createAudioFile('song.mp3')]);

      expect(screen.getByText('video.mp4')).not.toBeNull();
      expect(screen.getByText('song.mp3')).not.toBeNull();
    });
  });

  describe('clear all', () => {
    it('clears all videos when header remove button is clicked', () => {
      render(<App />);
      selectFiles([createVideoFile('a.mp4'), createVideoFile('b.mp4')]);

      fireEvent.click(
        screen.getByRole('button', { name: /^Remover Vídeos$/i }),
      );

      expect(screen.getByText(/arraste/i)).not.toBeNull();
    });
  });
});
