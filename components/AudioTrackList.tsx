import React from 'react';
import { X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { AudioMetadata } from '../types';

interface Props {
  audios: AudioMetadata[];
  activeAudioIndex: number | null;
  onActivateAudio: (index: number) => void;
  onRemoveAudio: (index: number) => void;
}

const AudioTrackList: React.FC<Props> = ({
  audios,
  activeAudioIndex,
  onActivateAudio,
  onRemoveAudio,
}) => {
  if (audios.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {audios.map((audio, index) => (
        <div
          key={audio.url}
          data-testid={`audio-slot-${index}`}
          className="relative"
          onClick={() => onActivateAudio(index)}
        >
          <AudioPlayer
            src={audio.url}
            name={audio.name}
            size={`${audio.size} • ${audio.type}`}
            isActive={activeAudioIndex === index}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveAudio(index);
            }}
            aria-label={`Remover ${audio.name}`}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AudioTrackList;
