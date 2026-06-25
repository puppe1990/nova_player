import React, { useState, useRef } from 'react';
import { Play, Zap, X } from 'lucide-react';
import MultiVideoGrid from './components/MultiVideoGrid';
import AudioPlayer from './components/AudioPlayer';
import FileUpload from './components/FileUpload';
import { VideoMetadata, AudioMetadata, MAX_VIDEOS } from './types';
import { isVideoFile, isAudioFile } from './lib/mediaFile';

function fileToVideoMetadata(file: File): VideoMetadata {
  return {
    name: file.name,
    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    type: file.type,
    url: URL.createObjectURL(file),
  };
}

function fileToAudioMetadata(file: File): AudioMetadata {
  return {
    name: file.name,
    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    type: file.type,
    url: URL.createObjectURL(file),
  };
}

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [audio, setAudio] = useState<AudioMetadata | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFilesSelect = (files: File[]) => {
    const remainingSlots = MAX_VIDEOS - videos.length;
    const allowed = files.slice(0, remainingSlots);

    for (const file of allowed) {
      if (isVideoFile(file)) {
        setVideos((prev) => {
          if (prev.length >= MAX_VIDEOS) return prev;
          return [...prev, fileToVideoMetadata(file)];
        });
      } else if (isAudioFile(file)) {
        if (audio?.url) URL.revokeObjectURL(audio.url);
        setAudio(fileToAudioMetadata(file));
      }
    }
  };

  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => {
      const video = prev[index];
      if (video?.url) URL.revokeObjectURL(video.url);

      const next = prev.filter((_, i) => i !== index);
      setActiveVideoIndex((current) => {
        if (current === null) return null;
        if (next.length === 0) return null;
        if (current >= next.length) return next.length - 1;
        return current;
      });
      return next;
    });
  };

  const handleActivateVideo = (index: number) => {
    setActiveVideoIndex(index);
  };

  const handleAddVideo = () => {
    fileInputRef.current?.click();
  };

  const clearAudio = () => {
    if (audio?.url) URL.revokeObjectURL(audio.url);
    setAudio(null);
  };

  const clearAll = () => {
    for (const video of videos) {
      if (video.url) URL.revokeObjectURL(video.url);
    }
    setVideos([]);
    setActiveVideoIndex(null);
    clearAudio();
  };

  const hasMedia = videos.length > 0 || audio;
  const remainingSlots = MAX_VIDEOS - videos.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">NovaPlayer</h1>
        </div>

        {hasMedia && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Remover Vídeos
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex-1 flex flex-col gap-6">
          {!hasMedia ? (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
              <FileUpload
                onFilesSelect={handleFilesSelect}
                remainingSlots={remainingSlots}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6">
              <MultiVideoGrid
                videos={videos}
                activeVideoIndex={
                  activeVideoIndex !== null && activeVideoIndex < videos.length
                    ? activeVideoIndex
                    : videos.length > 0
                      ? 0
                      : null
                }
                onActivateVideo={handleActivateVideo}
                onRemoveVideo={handleRemoveVideo}
                onAddVideo={remainingSlots > 0 ? handleAddVideo : undefined}
              />

              {remainingSlots > 0 && videos.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleAddVideo}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-sm text-slate-400 hover:text-blue-400"
                  >
                    <Play className="w-4 h-4" />
                    Adicionar mais vídeos
                  </button>
                </div>
              )}

              {audio && (
                <div className="flex-1 flex items-center justify-center">
                  <AudioPlayer
                    src={audio.url}
                    name={audio.name}
                    size={`${audio.size} • ${audio.type}`}
                    ref={audioRef}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:w-80 flex flex-col gap-6">
          <section className="glass p-6 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4" /> Atalhos do Teclado
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Play / Pause
                </span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">
                  Espaço
                </kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Pular 5s
                </span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">
                  Setas Esquerda/Direita
                </kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Velocidade +/-
                </span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">
                  Setas Cima/Baixo
                </kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Resetar Velocidade
                </span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">
                  R
                </kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Fullscreen
                </span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">
                  F
                </kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Loop últimos 5s
                </span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">
                  L
                </kbd>
              </li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl flex-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              Sobre o Player
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O NovaPlayer utiliza aceleração de hardware nativa para reprodução
              suave. Suba arquivos MP4, WebM ou OGG de forma 100% privada - o
              vídeo nunca deixa seu navegador.
            </p>
          </section>
        </div>
      </main>

      <footer className="lg:hidden p-4 glass border-t border-white/5 sticky bottom-0 z-50 flex justify-center">
        <p className="text-xs text-slate-500">NovaPlayer v1.0</p>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*,.wmv"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFilesSelect(Array.from(e.target.files));
          }
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />
    </div>
  );
};

export default App;
