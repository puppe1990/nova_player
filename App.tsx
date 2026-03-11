
import React, { useState, useCallback, useRef } from 'react';
import { Upload, Play, Info, Layers, Zap, X } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import FileUpload from './components/FileUpload';
import { VideoMetadata, AIAnalysis } from './types';
import { analyzeVideoFrame } from './services/geminiService';

const App: React.FC = () => {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      url: url
    });
    setAnalysis(null);
  };

  const clearVideo = () => {
    if (video?.url) URL.revokeObjectURL(video.url);
    setVideo(null);
    setAnalysis(null);
  };

  const handleAIAnalyze = async () => {
    if (!videoRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        const result = await analyzeVideoFrame(
          base64, 
          "Descreva o que está acontecendo neste momento do vídeo de forma concisa e amigável em Português."
        );
        setAnalysis({
          summary: result,
          timestamp: videoRef.current.currentTime
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">NovaPlayer <span className="text-blue-500 font-light">AI</span></h1>
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
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold truncate max-w-md">{video.name}</h2>
                    <p className="text-sm text-slate-400">{video.size} • {video.type}</p>
                  </div>
                  <button 
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Layers className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analisando...' : 'Analisar Frame (IA)'}
                  </button>
                </div>

                {analysis && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Insight da IA no tempo {Math.floor(analysis.timestamp)}s</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{analysis.summary}"
                    </p>
                  </div>
                )}
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
         <p className="text-xs text-slate-500">NovaPlayer AI v1.0 • Desenvolvido com Gemini</p>
      </footer>
    </div>
  );
};

export default App;
