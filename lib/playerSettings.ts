export interface PlayerSettings {
  multiEnabled: boolean;
  maxItems: number;
}

export const MIN_MEDIA_ITEMS = 1;
export const MAX_MEDIA_ITEMS = 8;
export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  multiEnabled: true,
  maxItems: 4,
};

const STORAGE_KEY = 'novaplayer.settings';

function clampMaxItems(value: number): number {
  const rounded = Math.round(value);
  return Math.min(MAX_MEDIA_ITEMS, Math.max(MIN_MEDIA_ITEMS, rounded));
}

/**
 * Coerce an unknown value (e.g. parsed localStorage) into valid PlayerSettings.
 *
 * normalizePlayerSettings({ multiEnabled: 'yes', maxItems: 99 })
 *   => { multiEnabled: true, maxItems: 8 }
 */
export function normalizePlayerSettings(raw: unknown): PlayerSettings {
  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_PLAYER_SETTINGS };
  }

  const candidate = raw as Partial<PlayerSettings>;
  const multiEnabled =
    typeof candidate.multiEnabled === 'boolean'
      ? candidate.multiEnabled
      : DEFAULT_PLAYER_SETTINGS.multiEnabled;
  const maxItems =
    typeof candidate.maxItems === 'number' &&
    Number.isFinite(candidate.maxItems)
      ? clampMaxItems(candidate.maxItems)
      : DEFAULT_PLAYER_SETTINGS.maxItems;

  return { multiEnabled, maxItems };
}

/**
 * Read persisted settings, falling back to defaults when storage is empty,
 * corrupt, or unavailable (e.g. private browsing).
 */
export function loadPlayerSettings(): PlayerSettings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PLAYER_SETTINGS };
    return normalizePlayerSettings(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PLAYER_SETTINGS };
  }
}

export function savePlayerSettings(settings: PlayerSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable; settings stay valid in memory.
  }
}

/**
 * Number of media items (videos + audios) the player accepts at once.
 * Single mode always caps at one item regardless of the configured maximum.
 */
export function getMediaLimit(settings: PlayerSettings): number {
  return settings.multiEnabled ? settings.maxItems : MIN_MEDIA_ITEMS;
}
