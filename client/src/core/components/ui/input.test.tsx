import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';
import { safeNavigate } from '@/lib/safeNavigation';

describe('Input and safe navigation', () => {
  it('accepts user input with an accessible label', () => {
    function TestInput() {
      const [value, setValue] = useState('');

      return (
        <label>
          <span className="sr-only">رقم الهاتف</span>
          <Input aria-label="رقم الهاتف" value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
      );
    }

    render(<TestInput />);

    const input = screen.getByRole('textbox', { name: 'رقم الهاتف' });
    fireEvent.change(input, { target: { value: '+966500000000' } });

    expect(input).toHaveValue('+966500000000');
  });

  it('blocks unsafe navigation targets', () => {
    const originalHref = window.location.href;

    render(
      <button type="button" onClick={() => safeNavigate('javascript:alert(1)')} aria-label="go unsafe">
        Unsafe action
      </button>
    );

    fireEvent.click(screen.getByRole('button', { name: 'go unsafe' }));

    expect(window.location.href).toBe(originalHref);
  });
});
