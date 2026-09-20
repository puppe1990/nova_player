import { useCallback, useState } from 'react';
import {
  loadPlayerSettings,
  normalizePlayerSettings,
  savePlayerSettings,
  PlayerSettings,
} from './playerSettings';

interface UsePlayerSettingsResult {
  settings: PlayerSettings;
  updateSettings: (patch: Partial<PlayerSettings>) => void;
}

/**
 * Player settings backed by localStorage, so the multi-media toggle and the
 * item limit survive page reloads.
 */
export function usePlayerSettings(): UsePlayerSettingsResult {
  const [settings, setSettings] = useState<PlayerSettings>(loadPlayerSettings);

  const updateSettings = useCallback((patch: Partial<PlayerSettings>) => {
    setSettings((previous) => {
      const next = normalizePlayerSettings({ ...previous, ...patch });
      savePlayerSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
