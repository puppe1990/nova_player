
import React, { useState } from 'react';
import { Upload, Film, FileVideo, Music, Headphones } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<Props> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full max-w-2xl p-12 rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-6 group ${
        isDragging
          ? 'border-blue-500 bg-blue-500/5 scale-105'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className={`p-6 rounded-3xl transition-all duration-500 ${isDragging ? 'bg-blue-600 scale-110' : 'bg-white/5 group-hover:scale-110'}`}>
        {isDragging ? (
          <FileVideo className="w-12 h-12 text-white animate-bounce" />
        ) : (
          <Upload className="w-12 h-12 text-blue-400 group-hover:text-blue-300" />
        )}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Arraste seu vídeo ou áudio aqui</h2>
        <p className="text-slate-400">Ou clique para selecionar um arquivo local</p>
      </div>

      <label className="cursor-pointer">
        <span className="px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-xl shadow-white/5 active:scale-95">
          Selecionar Arquivo
        </span>
        <input
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Film className="w-3 h-3" />
            Vídeo: MP4, MKV, WebM
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Headphones className="w-3 h-3" />
            Áudio: MP3, WAV, OGG
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
