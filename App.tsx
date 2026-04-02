
import React, { useState, useRef } from 'react';
import { Play, Zap, X } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import FileUpload from './components/FileUpload';
import { VideoMetadata } from './types';

const App: React.FC = () => {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      url: url
    });
  };

  const clearVideo = () => {
    if (video?.url) URL.revokeObjectURL(video.url);
    setVideo(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">NovaPlayer</h1>
        </div>
        
        {video && (
          <button 
            onClick={clearVideo}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Remover Vídeo
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex-1 flex flex-col gap-6">
          {!video ? (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl ring-1 ring-white/10">
                <VideoPlayer 
                  src={video.url} 
                  ref={videoRef}
                />
              </div>

              <div className="glass p-6 rounded-2xl space-y-4">
                <div>
                  <h2 className="text-lg font-semibold truncate max-w-md">{video.name}</h2>
                  <p className="text-sm text-slate-400">{video.size} • {video.type}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Info (Desktop Only) */}
        <div className="lg:w-80 flex flex-col gap-6">
          <section className="glass p-6 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4" /> Atalhos do Teclado
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Play / Pause</span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">Espaço</kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Pular 5s</span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">Setas Esquerda/Direita</kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Velocidade +/-</span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">Setas Cima/Baixo</kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Resetar Velocidade</span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">R</kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Fullscreen</span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">F</kbd>
              </li>
              <li className="flex justify-between items-center group">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Loop últimos 5s</span>
                <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded font-mono">L</kbd>
              </li>
            </ul>
          </section>

          <section className="glass p-6 rounded-2xl flex-1">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
               Sobre o Player
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O NovaPlayer utiliza aceleração de hardware nativa para reprodução suave. 
              Suba arquivos MP4, WebM ou OGG de forma 100% privada - o vídeo nunca deixa seu navegador.
            </p>
          </section>
        </div>
      </main>

      {/* Mobile Sticky Action */}
      <footer className="lg:hidden p-4 glass border-t border-white/5 sticky bottom-0 z-50 flex justify-center">
         <p className="text-xs text-slate-500">NovaPlayer v1.0</p>
      </footer>
    </div>
  );
};

export default App;
