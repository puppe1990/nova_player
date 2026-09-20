import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PLAYER_SETTINGS,
  getMediaLimit,
  loadPlayerSettings,
  MAX_MEDIA_ITEMS,
  MIN_MEDIA_ITEMS,
  normalizePlayerSettings,
  savePlayerSettings,
} from './playerSettings';

afterEach(() => {
  window.localStorage.clear();
});

describe('normalizePlayerSettings', () => {
  it('returns defaults for non-object values', () => {
    expect(normalizePlayerSettings(null)).toEqual(DEFAULT_PLAYER_SETTINGS);
    expect(normalizePlayerSettings('broken')).toEqual(DEFAULT_PLAYER_SETTINGS);
  });

  it('keeps valid multiEnabled and maxItems', () => {
    expect(
      normalizePlayerSettings({ multiEnabled: false, maxItems: 3 }),
    ).toEqual({ multiEnabled: false, maxItems: 3 });
  });

  it('clamps maxItems to the allowed range', () => {
    expect(normalizePlayerSettings({ maxItems: 99 }).maxItems).toBe(
      MAX_MEDIA_ITEMS,
    );
    expect(normalizePlayerSettings({ maxItems: -5 }).maxItems).toBe(
      MIN_MEDIA_ITEMS,
    );
  });

  it('falls back to default values for wrong field types', () => {
    expect(
      normalizePlayerSettings({ multiEnabled: 'yes', maxItems: 'many' }),
    ).toEqual(DEFAULT_PLAYER_SETTINGS);
  });
});

describe('loadPlayerSettings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadPlayerSettings()).toEqual(DEFAULT_PLAYER_SETTINGS);
  });

  it('returns defaults when stored JSON is corrupt', () => {
    window.localStorage.setItem('novaplayer.settings', '{not json');
    expect(loadPlayerSettings()).toEqual(DEFAULT_PLAYER_SETTINGS);
  });

  it('round-trips settings saved through savePlayerSettings', () => {
    savePlayerSettings({ multiEnabled: false, maxItems: 2 });
    expect(loadPlayerSettings()).toEqual({ multiEnabled: false, maxItems: 2 });
  });
});

describe('getMediaLimit', () => {
  it('returns maxItems when multi is enabled', () => {
    expect(getMediaLimit({ multiEnabled: true, maxItems: 6 })).toBe(6);
  });

  it('returns one when multi is disabled', () => {
    expect(getMediaLimit({ multiEnabled: false, maxItems: 6 })).toBe(
      MIN_MEDIA_ITEMS,
    );
  });
});
