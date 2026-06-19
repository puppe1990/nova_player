import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MultiVideoGrid from './MultiVideoGrid';
import { VideoMetadata } from '../types';

function createVideo(name: string): VideoMetadata {
  return {
    name,
    size: '5.00 MB',
    type: 'video/mp4',
    url: `blob:video-${name}`,
  };
}

function defaultProps() {
  return {
    videos: [] as VideoMetadata[],
    activeVideoIndex: null as number | null,
    onActivateVideo: vi.fn(),
    onRemoveVideo: vi.fn(),
  };
}

afterEach(cleanup);

describe('MultiVideoGrid', () => {
  describe('empty state', () => {
    it('shows nothing when videos is empty and onAddVideo is not provided', () => {
      const { container } = render(
        <MultiVideoGrid {...defaultProps()} videos={[]} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('shows 4 empty slots when onAddVideo is provided with empty videos', () => {
      const onAddVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[]}
          onAddVideo={onAddVideo}
        />,
      );
      const slots = screen.getAllByTestId('empty-slot');
      expect(slots).toHaveLength(4);
    });
  });

  describe('video slot counts', () => {
    it('renders 1 video slot and 3 empty slots for 1 video', () => {
      const onAddVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('a.mp4')]}
          activeVideoIndex={0}
          onAddVideo={onAddVideo}
        />,
      );
      expect(screen.getAllByTestId(/^video-slot-/)).toHaveLength(1);
      expect(screen.getAllByTestId('empty-slot')).toHaveLength(3);
    });

    it('renders 2 video slots and 2 empty slots for 2 videos', () => {
      const onAddVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('a.mp4'), createVideo('b.mp4')]}
          activeVideoIndex={0}
          onAddVideo={onAddVideo}
        />,
      );
      expect(screen.getAllByTestId(/^video-slot-/)).toHaveLength(2);
      expect(screen.getAllByTestId('empty-slot')).toHaveLength(2);
    });

    it('renders 3 video slots and 1 empty slot for 3 videos', () => {
      const onAddVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[
            createVideo('a.mp4'),
            createVideo('b.mp4'),
            createVideo('c.mp4'),
          ]}
          activeVideoIndex={0}
          onAddVideo={onAddVideo}
        />,
      );
      expect(screen.getAllByTestId(/^video-slot-/)).toHaveLength(3);
      expect(screen.getAllByTestId('empty-slot')).toHaveLength(1);
    });

    it('renders 4 video slots and 0 empty slots for 4 videos', () => {
      const onAddVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[
            createVideo('a.mp4'),
            createVideo('b.mp4'),
            createVideo('c.mp4'),
            createVideo('d.mp4'),
          ]}
          activeVideoIndex={0}
          onAddVideo={onAddVideo}
        />,
      );
      expect(screen.getAllByTestId(/^video-slot-/)).toHaveLength(4);
      expect(screen.queryByTestId('empty-slot')).toBeNull();
    });
  });

  describe('video name labels', () => {
    it('displays video name below each slot', () => {
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('my-movie.mp4')]}
          activeVideoIndex={0}
        />,
      );
      expect(screen.getByText('my-movie.mp4')).not.toBeNull();
    });

    it('truncates long video names', () => {
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('very-long-video-name-that-exceeds.mp4')]}
          activeVideoIndex={0}
        />,
      );
      const label = screen.getByTestId(/^video-slot-/).querySelector('p');
      expect(label?.className).toContain('truncate');
    });
  });

  describe('interactions', () => {
    it('calls onAddVideo when an empty slot is clicked', () => {
      const onAddVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('a.mp4')]}
          activeVideoIndex={0}
          onAddVideo={onAddVideo}
        />,
      );
      fireEvent.click(screen.getAllByTestId('empty-slot')[0]);
      expect(onAddVideo).toHaveBeenCalledTimes(1);
    });

    it('calls onRemoveVideo with correct index when remove button is clicked', () => {
      const onRemoveVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('a.mp4'), createVideo('b.mp4')]}
          activeVideoIndex={0}
          onRemoveVideo={onRemoveVideo}
        />,
      );
      const removeButtons = screen.getAllByRole('button', {
        name: /remover/i,
      });
      expect(removeButtons).toHaveLength(2);
      fireEvent.click(removeButtons[1]);
      expect(onRemoveVideo).toHaveBeenCalledWith(1);
    });

    it('calls onActivateVideo with index when a video slot is clicked', () => {
      const onActivateVideo = vi.fn();
      render(
        <MultiVideoGrid
          {...defaultProps()}
          videos={[createVideo('a.mp4'), createVideo('b.mp4')]}
          activeVideoIndex={0}
          onActivateVideo={onActivateVideo}
        />,
      );
      fireEvent.click(screen.getAllByTestId(/^video-slot-/)[1]);
      expect(onActivateVideo).toHaveBeenCalledWith(1);
    });
  });
});
