import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AudioTrackList from './AudioTrackList';
import { AudioMetadata } from '../types';

function createAudio(name: string): AudioMetadata {
  return {
    name,
    size: '3.00 MB',
    type: 'audio/mpeg',
    url: `blob:audio-${name}`,
  };
}

function defaultProps() {
  return {
    audios: [] as AudioMetadata[],
    activeAudioIndex: null as number | null,
    onActivateAudio: vi.fn(),
    onRemoveAudio: vi.fn(),
  };
}

afterEach(cleanup);

describe('AudioTrackList', () => {
  it('renders nothing when there are no audios', () => {
    const { container } = render(<AudioTrackList {...defaultProps()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one player per audio track', () => {
    render(
      <AudioTrackList
        {...defaultProps()}
        audios={[createAudio('a.mp3'), createAudio('b.mp3')]}
      />,
    );

    expect(screen.getByText('a.mp3')).not.toBeNull();
    expect(screen.getByText('b.mp3')).not.toBeNull();
  });

  it('calls onRemoveAudio with the index of the clicked remove button', () => {
    const onRemoveAudio = vi.fn();
    render(
      <AudioTrackList
        {...defaultProps()}
        audios={[createAudio('a.mp3'), createAudio('b.mp3')]}
        onRemoveAudio={onRemoveAudio}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /remover b\.mp3/i }));

    expect(onRemoveAudio).toHaveBeenCalledWith(1);
  });

  it('calls onActivateAudio when a track is clicked', () => {
    const onActivateAudio = vi.fn();
    render(
      <AudioTrackList
        {...defaultProps()}
        audios={[createAudio('a.mp3'), createAudio('b.mp3')]}
        onActivateAudio={onActivateAudio}
      />,
    );

    fireEvent.click(screen.getByTestId('audio-slot-1'));

    expect(onActivateAudio).toHaveBeenCalledWith(1);
  });
});
