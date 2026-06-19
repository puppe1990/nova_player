import React from 'react';
import { X, Plus } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { VideoMetadata, MAX_VIDEOS } from '../types';

interface Props {
  videos: VideoMetadata[];
  activeVideoIndex: number | null;
  onActivateVideo: (index: number) => void;
  onRemoveVideo: (index: number) => void;
  onAddVideo?: () => void;
}

const gridCols: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2',
  4: 'grid-cols-2',
};

function getGridClassName(videoCount: number): string {
  const cols = gridCols[videoCount] ?? 'grid-cols-2';
  return `grid ${cols} gap-4 w-full`;
}

const MultiVideoGrid: React.FC<Props> = ({
  videos,
  activeVideoIndex,
  onActivateVideo,
  onRemoveVideo,
  onAddVideo,
}) => {
  if (videos.length === 0 && !onAddVideo) {
    return null;
  }

  const totalSlots = Math.max(videos.length, onAddVideo ? MAX_VIDEOS : 0);

  if (totalSlots === 0) {
    return null;
  }

  return (
    <div
      data-testid="video-grid"
      className={getGridClassName(videos.length || MAX_VIDEOS)}
    >
      {Array.from({ length: totalSlots }, (_, i) => {
        const video = videos[i] ?? null;

        if (video) {
          const isActive = activeVideoIndex === i;
          return (
            <div
              key={video.url}
              data-testid={`video-slot-${i}`}
              className={`relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg ring-1 ${
                isActive ? 'ring-blue-500 ring-2' : 'ring-white/10'
              }`}
              onClick={() => onActivateVideo(i)}
            >
              <VideoPlayer src={video.url} isActive={isActive} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveVideo(i);
                }}
                aria-label={`Remover ${video.name}`}
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs font-medium text-white truncate">
                  {video.name}
                </p>
              </div>
            </div>
          );
        }

        if (onAddVideo && i >= videos.length) {
          return (
            <div
              key={`empty-${i}`}
              data-testid="empty-slot"
              onClick={onAddVideo}
              className="relative rounded-xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10 aspect-video flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
            >
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                <Plus className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="text-sm text-slate-500 group-hover:text-blue-400 transition-colors font-medium">
                Adicionar vídeo
              </span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default MultiVideoGrid;
