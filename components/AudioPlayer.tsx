import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, FastForward, Rewind, Repeat } from 'lucide-react';

interface Props {
  src: string;
}

const AudioPlayer = forwardRef<HTMLAudioElement, Props>(({ src }, ref) => {
  const innerRef = useRef<HTMLAudioElement>(null);
  
  useImperativeHandle(ref, () => innerRef.current!);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoopingLastFive, setIsLoopingLastFive] = useState(false);

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (innerRef.current) {
      innerRef.current.volume = value;
      setIsMuted(value === 0);
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

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

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-6 glass border border-white/10">
      <audio
        ref={innerRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (innerRef.current) {
            const loopWindow = loopWindowRef.current;

            if (loopWindow && innerRef.current.currentTime >= loopWindow.end) {
              innerRef.current.currentTime = loopWindow.start;
            }

            setCurrentTime(innerRef.current.currentTime);
            setProgress((innerRef.current.currentTime / innerRef.current.duration) * 100);
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
      />

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleProgressChange}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button onClick={() => skip(-5)} className="hover:text-blue-400 transition-colors">
              <Rewind className="w-5 h-5" />
            </button>
            <button onClick={() => skip(5)} className="hover:text-blue-400 transition-colors">
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

            <div className="flex items-center gap-2 ml-2">
              <button onClick={() => { const m = !isMuted; setIsMuted(m); if (innerRef.current) innerRef.current.muted = m; }} className="hover:text-blue-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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
                onChange={(e) => adjustPlaybackRate(parseFloat(e.target.value) - playbackRate)}
                className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map(r => (
                  <option key={r} value={r} className="bg-slate-900 text-white">{r}x</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;
