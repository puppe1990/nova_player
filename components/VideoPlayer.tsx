import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  FastForward,
  Rewind,
  Repeat,
} from 'lucide-react';

interface Props {
  src: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, Props>(({ src }, ref) => {
  const innerRef = useRef<HTMLVideoElement>(null);
  const ghostRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Expose innerRef to parent
  useImperativeHandle(ref, () => innerRef.current!);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoopingLastFive, setIsLoopingLastFive] = useState(false);
  const [isFloatingModeArmed, setIsFloatingModeArmed] = useState(false);

  // Preview states
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewPos, setPreviewPos] = useState(0);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopWindowRef = useRef<{ start: number; end: number } | null>(null);

  const togglePlay = () => {
    if (innerRef.current?.paused) {
      innerRef.current.play();
    } else {
      innerRef.current?.pause();
    }
  };

  const skip = (amount: number) => {
    if (innerRef.current) {
      innerRef.current.currentTime += amount;
    }
  };

  const toggleLastFiveLoop = () => {
    if (!innerRef.current) return;

    if (isLoopingLastFive) {
      loopWindowRef.current = null;
      setIsLoopingLastFive(false);
      return;
    }

    const loopEnd = innerRef.current.currentTime;
    const loopStart = Math.max(0, loopEnd - 5);

    loopWindowRef.current = { start: loopStart, end: loopEnd };
    innerRef.current.currentTime = loopStart;
    if (innerRef.current.paused) {
      innerRef.current.play();
    }
    setIsLoopingLastFive(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (innerRef.current) {
      innerRef.current.currentTime = time;
    }
    if (isLoopingLastFive) {
      loopWindowRef.current = null;
      setIsLoopingLastFive(false);
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * duration;

    setPreviewTime(time);
    setPreviewPos(x);
    setPreviewVisible(true);

    if (ghostRef.current) {
      ghostRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (innerRef.current) {
      innerRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const adjustPlaybackRate = (delta: number) => {
    const newRate = Math.max(0.25, Math.min(4, playbackRate + delta));
    setPlaybackRate(newRate);
    if (innerRef.current) {
      innerRef.current.playbackRate = newRate;
    }
  };

  const resetPlaybackRate = () => {
    setPlaybackRate(1);
    if (innerRef.current) {
      innerRef.current.playbackRate = 1;
    }
  };

  const exitPictureInPicture = async () => {
    if (!document.pictureInPictureElement) return;
    await document.exitPictureInPicture();
  };

  const enterPictureInPicture = async () => {
    if (!innerRef.current) return;
    if (document.pictureInPictureElement) return;
    if (innerRef.current.paused) return;
    await innerRef.current.requestPictureInPicture();
  };

  const armFloatingMode = async () => {
    setIsFloatingModeArmed(true);

    try {
      await enterPictureInPicture();
    } catch {
      setIsFloatingModeArmed(false);
    }
  };

  const toggleFloatingMode = async () => {
    if (!isFloatingModeArmed) {
      await armFloatingMode();
      return;
    }

    setIsFloatingModeArmed(false);
    await exitPictureInPicture();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustPlaybackRate(0.25);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustPlaybackRate(-0.25);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetPlaybackRate();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          toggleLastFiveLoop();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (innerRef.current) innerRef.current.muted = !isMuted;
          setIsMuted(!isMuted);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackRate, isMuted, isLoopingLastFive]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="group relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
        setPreviewVisible(false);
      }}
    >
      {/* Main Video */}
      <video
        ref={innerRef}
        src={src}
        className="max-w-full max-h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (innerRef.current) {
            const loopWindow = loopWindowRef.current;

            if (loopWindow && innerRef.current.currentTime >= loopWindow.end) {
              innerRef.current.currentTime = loopWindow.start;
            }

            setCurrentTime(innerRef.current.currentTime);
            setProgress(
              (innerRef.current.currentTime / innerRef.current.duration) * 100,
            );
          }
        }}
        onEnded={() => {
          if (loopWindowRef.current && innerRef.current) {
            innerRef.current.currentTime = loopWindowRef.current.start;
            innerRef.current.play();
            return;
          }

          setIsPlaying(false);
        }}
        onLoadedMetadata={() => setDuration(innerRef.current?.duration || 0)}
        onClick={togglePlay}
      />

      {/* Ghost Video for Preview Generation */}
      <video ref={ghostRef} src={src} muted preload="auto" className="hidden" />

      {/* Large Center Play Indicator */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity"
        >
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20 scale-110 hover:scale-125 transition-transform">
            <Play className="w-12 h-12 text-white fill-current" />
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 transform ${
          showControls
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Area with Preview */}
        <div
          ref={timelineRef}
          className="group/progress relative mb-6 cursor-pointer"
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={() => setPreviewVisible(false)}
        >
          {/* Hover Preview Box */}
          {previewVisible && (
            <div
              className="absolute bottom-full mb-4 pointer-events-none transform -translate-x-1/2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
              style={{ left: `${previewPos}px` }}
            >
              <div className="w-48 aspect-video bg-black rounded-lg border-2 border-white/20 shadow-2xl overflow-hidden glass relative">
                <video
                  src={src}
                  ref={(el) => {
                    if (el) el.currentTime = previewTime;
                  }}
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white tabular-nums">
                  {formatTime(previewTime)}
                </div>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20 mt-[-1px]"></div>
            </div>
          )}

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer group-hover/progress:h-2.5 transition-all accent-blue-500 relative z-10"
          />

          {/* Hover highlight bar */}
          {previewVisible && (
            <div
              className="absolute top-0 left-0 h-full bg-white/20 pointer-events-none rounded-lg"
              style={{ width: `${previewPos}px` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
            </button>
            <button
              onClick={() => skip(-5)}
              className="hover:text-blue-400 transition-colors"
            >
              <Rewind className="w-5 h-5" />
            </button>
            <button
              onClick={() => skip(5)}
              className="hover:text-blue-400 transition-colors"
            >
              <FastForward className="w-5 h-5" />
            </button>
            <button
              onClick={toggleLastFiveLoop}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                isLoopingLastFive
                  ? 'border-blue-400/70 bg-blue-500/20 text-blue-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-blue-400'
              }`}
            >
              <Repeat className="w-4 h-4" />
              Loop 5s
            </button>
            <button
              aria-pressed={isFloatingModeArmed}
              onClick={() => void toggleFloatingMode()}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                isFloatingModeArmed
                  ? 'border-blue-400/70 bg-blue-500/20 text-blue-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-blue-400'
              }`}
            >
              Flutuar ao trocar aba
            </button>

            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => {
                  const m = !isMuted;
                  setIsMuted(m);
                  if (innerRef.current) innerRef.current.muted = m;
                }}
                className="hover:text-blue-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="text-sm font-medium text-slate-300 ml-2">
              <span className="tabular-nums">{formatTime(currentTime)}</span>
              <span className="mx-1 opacity-50">/</span>
              <span className="tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
              <span className="text-xs font-bold text-slate-400">SPEED</span>
              <select
                value={playbackRate}
                onChange={(e) =>
                  adjustPlaybackRate(parseFloat(e.target.value) - playbackRate)
                }
                className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}x
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={toggleFullscreen}
              className="hover:text-blue-400 transition-colors"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
