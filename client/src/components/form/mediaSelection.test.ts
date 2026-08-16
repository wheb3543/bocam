import { describe, expect, it, vi } from 'vitest';
import { completeMediaSelection } from './mediaSelection';

describe('completeMediaSelection', () => {
  it('passes the selected media URL to the field and closes the picker', () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();

    completeMediaSelection('https://storage.example.test/uploads/hero.avif', onSelect, onOpenChange);

    expect(onSelect).toHaveBeenCalledWith('https://storage.example.test/uploads/hero.avif');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
