import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VideoPlayer from './VideoPlayer';

function setDocumentHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
}

describe('VideoPlayer floating mode', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    setDocumentHidden(false);
    Object.defineProperty(document, 'pictureInPictureElement', {
      configurable: true,
      value: null,
    });
  });

  it('does not request picture-in-picture when tab hides', () => {
    const requestPictureInPicture = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(
      HTMLVideoElement.prototype,
      'requestPictureInPicture',
      {
        configurable: true,
        value: requestPictureInPicture,
      },
    );

    render(<VideoPlayer src="movie.mp4" />);

    const button = screen.getByRole('button', {
      name: /flutuar ao trocar aba/i,
    });
    fireEvent.click(button);

    const video = document.querySelector('video');
    if (!video) {
      throw new Error('Expected one video element for Picture-in-Picture test');
    }

    Object.defineProperty(video, 'paused', {
      configurable: true,
      value: false,
    });

    setDocumentHidden(true);
    fireEvent(document, new Event('visibilitychange'));

    expect(requestPictureInPicture).not.toHaveBeenCalled();
  });

  it('requests picture-in-picture from the floating mode button click', () => {
    const requestPictureInPicture = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(
      HTMLVideoElement.prototype,
      'requestPictureInPicture',
      {
        configurable: true,
        value: requestPictureInPicture,
      },
    );

    render(<VideoPlayer src="movie.mp4" />);

    const video = document.querySelector('video');
    if (!video) {
      throw new Error('Expected one video element for Picture-in-Picture test');
    }

    Object.defineProperty(video, 'paused', {
      configurable: true,
      value: false,
    });

    const button = screen.getByRole('button', {
      name: /flutuar ao trocar aba/i,
    });
    fireEvent.click(button);

    expect(requestPictureInPicture).toHaveBeenCalledTimes(1);
  });

  it('does not request picture-in-picture when floating mode is off', () => {
    const requestPictureInPicture = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(
      HTMLVideoElement.prototype,
      'requestPictureInPicture',
      {
        configurable: true,
        value: requestPictureInPicture,
      },
    );

    render(<VideoPlayer src="movie.mp4" />);

    const video = document.querySelector('video');
    if (!video) {
      throw new Error('Expected one video element for Picture-in-Picture test');
    }

    Object.defineProperty(video, 'paused', {
      configurable: true,
      value: false,
    });

    setDocumentHidden(true);
    fireEvent(document, new Event('visibilitychange'));

    expect(requestPictureInPicture).not.toHaveBeenCalled();
  });
});
