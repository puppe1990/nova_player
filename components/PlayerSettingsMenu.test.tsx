import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PlayerSettingsMenu from './PlayerSettingsMenu';

function renderMenu(
  settings = { multiEnabled: true, maxItems: 4 },
  onChange = vi.fn(),
) {
  render(<PlayerSettingsMenu settings={settings} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /configurações/i }));
  return { onChange };
}

afterEach(cleanup);

describe('PlayerSettingsMenu', () => {
  it('toggles the multi-media option', () => {
    const { onChange } = renderMenu();

    fireEvent.click(
      screen.getByRole('checkbox', { name: /múltiplos áudios e vídeos/i }),
    );

    expect(onChange).toHaveBeenCalledWith({ multiEnabled: false });
  });

  it('updates the maximum number of items as a number', () => {
    const { onChange } = renderMenu();

    fireEvent.change(
      screen.getByRole('spinbutton', { name: /máximo de itens/i }),
      {
        target: { value: '7' },
      },
    );

    expect(onChange).toHaveBeenCalledWith({ maxItems: 7 });
  });

  it('disables the item limit input when multi-media is off', () => {
    renderMenu({ multiEnabled: false, maxItems: 4 });

    expect(
      screen.getByRole('spinbutton', { name: /máximo de itens/i }),
    ).toBeDisabled();
  });
});
