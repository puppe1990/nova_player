import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AudioPlayer from './AudioPlayer';

function getAudioElement(): HTMLAudioElement {
  const audio = document.querySelector('audio');
  if (!audio) {
    throw new Error('Expected one audio element from AudioPlayer');
  }
  return audio;
}

describe('AudioPlayer repeat', () => {
  afterEach(cleanup);

  it('enables full-track repeat when the repeat button is clicked', () => {
    render(<AudioPlayer src="song.mp3" />);

    fireEvent.click(screen.getByRole('button', { name: /repetir música/i }));

    expect(getAudioElement().loop).toBe(true);
  });

  it('disables full-track repeat when the repeat button is toggled off', () => {
    render(<AudioPlayer src="song.mp3" />);

    const button = screen.getByRole('button', { name: /repetir música/i });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(getAudioElement().loop).toBe(false);
  });
});
