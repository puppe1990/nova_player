import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { loadPlayerSettings, MAX_MEDIA_ITEMS } from './playerSettings';
import { usePlayerSettings } from './usePlayerSettings';

afterEach(() => {
  window.localStorage.clear();
});

describe('usePlayerSettings', () => {
  it('starts from persisted settings', () => {
    window.localStorage.setItem(
      'novaplayer.settings',
      JSON.stringify({ multiEnabled: false, maxItems: 2 }),
    );

    const { result } = renderHook(() => usePlayerSettings());

    expect(result.current.settings).toEqual({
      multiEnabled: false,
      maxItems: 2,
    });
  });

  it('persists updates and clamps the maximum', () => {
    const { result } = renderHook(() => usePlayerSettings());

    act(() => result.current.updateSettings({ maxItems: 99 }));

    expect(result.current.settings.maxItems).toBe(MAX_MEDIA_ITEMS);
    expect(loadPlayerSettings().maxItems).toBe(MAX_MEDIA_ITEMS);
  });
});
