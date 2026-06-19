import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FileUpload from './FileUpload';

function createVideoFile(name: string): File {
  return new File(['video-content'], name, { type: 'video/mp4' });
}

function createAudioFile(name: string): File {
  return new File(['audio-content'], name, { type: 'audio/mpeg' });
}

function createTextFile(name: string): File {
  return new File(['text-content'], name, { type: 'text/plain' });
}

afterEach(cleanup);

describe('FileUpload', () => {
  describe('single file', () => {
    it('calls onFilesSelect with single video file', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={4} />);

      const input = document.querySelector('input[type="file"]')!;
      const file = createVideoFile('movie.mp4');
      fireEvent.change(input, { target: { files: [file] } });

      expect(onFilesSelect).toHaveBeenCalledWith([file]);
    });

    it('calls onFilesSelect with single audio file', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={4} />);

      const input = document.querySelector('input[type="file"]')!;
      const file = createAudioFile('song.mp3');
      fireEvent.change(input, { target: { files: [file] } });

      expect(onFilesSelect).toHaveBeenCalledWith([file]);
    });
  });

  describe('multiple files', () => {
    it('selects multiple video files from drop', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={4} />);

      const dropZone = screen
        .getByText('Arraste seu vídeo ou áudio aqui')
        .closest('div')!;
      const files = [
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
      ];

      fireEvent.drop(dropZone, {
        dataTransfer: { files },
      });

      expect(onFilesSelect).toHaveBeenCalledWith(files);
    });

    it('selects multiple video files from input change', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={4} />);

      const input = document.querySelector('input[type="file"]')!;
      const files = [
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
      ];

      Object.defineProperty(input, 'files', {
        value: files,
      });
      fireEvent.change(input);

      expect(onFilesSelect).toHaveBeenCalledWith(files);
    });

    it('caps video files to remainingSlots', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={2} />);

      const input = document.querySelector('input[type="file"]')!;
      const files = [
        createVideoFile('a.mp4'),
        createVideoFile('b.mp4'),
        createVideoFile('c.mp4'),
        createVideoFile('d.mp4'),
      ];

      Object.defineProperty(input, 'files', {
        value: files,
      });
      fireEvent.change(input);

      expect(onFilesSelect).toHaveBeenCalledWith([files[0], files[1]]);
    });

    it('filters out non-media files from selection', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={4} />);

      const dropZone = screen
        .getByText('Arraste seu vídeo ou áudio aqui')
        .closest('div')!;
      const files = [
        createVideoFile('a.mp4'),
        createTextFile('readme.txt'),
        createVideoFile('b.mp4'),
        createAudioFile('song.mp3'),
      ];

      fireEvent.drop(dropZone, {
        dataTransfer: { files },
      });

      expect(onFilesSelect).toHaveBeenCalledWith([
        files[0],
        files[2],
        files[3],
      ]);
    });

    it('does not call onFilesSelect when all files are non-media', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={4} />);

      const dropZone = screen
        .getByText('Arraste seu vídeo ou áudio aqui')
        .closest('div')!;
      const files = [createTextFile('a.txt'), createTextFile('b.txt')];

      fireEvent.drop(dropZone, {
        dataTransfer: { files },
      });

      expect(onFilesSelect).not.toHaveBeenCalled();
    });

    it('does not call onFilesSelect when remainingSlots is 0', () => {
      const onFilesSelect = vi.fn();
      render(<FileUpload onFilesSelect={onFilesSelect} remainingSlots={0} />);

      const dropZone = screen
        .getByText('Arraste seu vídeo ou áudio aqui')
        .closest('div')!;
      const files = [createVideoFile('a.mp4')];

      fireEvent.drop(dropZone, {
        dataTransfer: { files },
      });

      expect(onFilesSelect).not.toHaveBeenCalled();
    });
  });
});
