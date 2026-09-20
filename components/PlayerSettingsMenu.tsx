import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  MAX_MEDIA_ITEMS,
  MIN_MEDIA_ITEMS,
  PlayerSettings,
} from '../lib/playerSettings';

interface Props {
  settings: PlayerSettings;
  onChange: (patch: Partial<PlayerSettings>) => void;
}

const PlayerSettingsMenu: React.FC<Props> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Configurações"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm"
      >
        <Settings className="w-4 h-4" />
        Configurações
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Configurações do player"
          className="absolute right-0 mt-2 w-72 glass rounded-2xl border border-white/10 p-4 space-y-4 z-50"
        >
          <label className="flex items-center justify-between gap-3 text-sm">
            Múltiplos áudios e vídeos
            <input
              type="checkbox"
              checked={settings.multiEnabled}
              onChange={(e) => onChange({ multiEnabled: e.target.checked })}
              className="h-4 w-4 accent-blue-500"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-sm">
            Máximo de itens
            <input
              type="number"
              min={MIN_MEDIA_ITEMS}
              max={MAX_MEDIA_ITEMS}
              value={settings.maxItems}
              disabled={!settings.multiEnabled}
              onChange={(e) => onChange({ maxItems: Number(e.target.value) })}
              className="w-16 rounded-lg bg-white/10 border border-white/10 px-2 py-1 text-center disabled:opacity-40"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PlayerSettingsMenu;
