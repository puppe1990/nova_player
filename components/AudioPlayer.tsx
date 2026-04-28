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
  FastForward,
  Rewind,
  Repeat,
  Music,
} from 'lucide-react';

interface Props {
  src: string;
  name?: string;
  size?: string;
}

const AudioPlayer = forwardRef<HTMLAudioElement, Props>(
  ({ src, name, size }, ref) => {
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
      <div className="w-full max-w-lg mx-auto bg-slate-900 rounded-2xl p-8 glass border border-white/10 space-y-6">
        <audio
          ref={innerRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (innerRef.current) {
              const loopWindow = loopWindowRef.current;
              if (
                loopWindow &&
                innerRef.current.currentTime >= loopWindow.end
              ) {
                innerRef.current.currentTime = loopWindow.start;
              }
              setCurrentTime(innerRef.current.currentTime);
              setProgress(
                (innerRef.current.currentTime / innerRef.current.duration) *
                  100,
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
        />

        {/* Ícone visual + info */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`p-6 rounded-full bg-blue-600/15 border border-blue-500/20 transition-all duration-500 ${isPlaying ? 'ring-4 ring-blue-500/20 shadow-lg shadow-blue-600/20' : ''}`}
          >
            <Music
              className={`w-10 h-10 text-blue-400 transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}
            />
          </div>
          {name && (
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                {name}
              </p>
              {size && <p className="text-xs text-slate-500 mt-0.5">{size}</p>}
            </div>
          )}
        </div>

        {/* Barra de progresso + tempo */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 tabular-nums px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles principais */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => skip(-5)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Rewind className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={() => skip(5)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FastForward className="w-6 h-6" />
          </button>
        </div>

        {/* Controles secundários */}
        <div className="flex items-center justify-between gap-2">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const m = !isMuted;
                setIsMuted(m);
                if (innerRef.current) innerRef.current.muted = m;
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Loop */}
          <button
            onClick={toggleLastFiveLoop}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLoopingLastFive
                ? 'border-blue-400/70 bg-blue-500/20 text-blue-200'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-blue-400'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Loop 5s
          </button>

          {/* Speed */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
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
        </div>
      </div>
    );
  },
);

export default AudioPlayer;
