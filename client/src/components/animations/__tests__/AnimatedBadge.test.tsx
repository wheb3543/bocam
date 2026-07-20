/**
 * اختبارات AnimatedBadge Component
 * AnimatedBadge Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedBadge from '../AnimatedBadge';

describe('AnimatedBadge - Rendering', () => {
  it('يجب أن يعرض العدد الصحيح', () => {
    render(<AnimatedBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('يجب أن يعرض 99+ عندما يتجاوز العدد maxDisplay', () => {
    render(<AnimatedBadge count={150} maxDisplay={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('يجب أن يعرض null عندما يكون العدد 0 و showZero=false', () => {
    const { container } = render(<AnimatedBadge count={0} showZero={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('يجب أن يعرض 0 عندما يكون showZero=true', () => {
    render(<AnimatedBadge count={0} showZero={true} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('يجب أن يطبق className المخصص', () => {
    const { container } = render(<AnimatedBadge count={5} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('AnimatedBadge - Pulse Effect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يظهر تأثير النبض عند زيادة العدد', () => {
    const { rerender } = render(<AnimatedBadge count={5} pulseOnChange={true} />);
    
    rerender(<AnimatedBadge count={10} pulseOnChange={true} />);
    
    // Pulse should be active
    vi.advanceTimersByTime(100);
  });

  it('يجب أن لا يظهر تأثير النبض عند انخفاض العدد', () => {
    const { rerender } = render(<AnimatedBadge count={10} pulseOnChange={true} />);
    
    rerender(<AnimatedBadge count={5} pulseOnChange={true} />);
    
    // Scale should still happen but not pulse
    vi.advanceTimersByTime(100);
  });

  it('يجب أن لا يظهر تأثير النبض عندما pulseOnChange=false', () => {
    const { rerender } = render(<AnimatedBadge count={5} pulseOnChange={false} />);
    
    rerender(<AnimatedBadge count={10} pulseOnChange={false} />);
    
    vi.advanceTimersByTime(100);
  });

  it('يجب أن يستخدم pulseDuration المخصص', () => {
    render(<AnimatedBadge count={5} pulseOnChange={true} pulseDuration={2000} />);
    
    // Should respect custom duration
    vi.advanceTimersByTime(2000);
  });
});

describe('AnimatedBadge - Scale Effect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يظهر تأثير التكبير عند تغيير العدد', () => {
    const { rerender } = render(<AnimatedBadge count={5} pulseOnChange={true} />);
    
    rerender(<AnimatedBadge count={10} pulseOnChange={true} />);
    
    vi.advanceTimersByTime(300);
  });

  it('يجب أن يعود التكبير إلى الحالة الطبيعية بعد 300ms', () => {
    const { rerender } = render(<AnimatedBadge count={5} pulseOnChange={true} />);
    
    rerender(<AnimatedBadge count={10} pulseOnChange={true} />);
    
    vi.advanceTimersByTime(300);
  });
});

describe('AnimatedBadge - Edge Cases', () => {
  it('يجب أن يتعامل مع الأعداد السالبة', () => {
    const { container } = render(<AnimatedBadge count={-5} showZero={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('يجب أن يتعامل مع maxDisplay=0', () => {
    render(<AnimatedBadge count={5} maxDisplay={0} />);
    expect(screen.getByText('0+')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع maxDisplay سلبي', () => {
    render(<AnimatedBadge count={5} maxDisplay={-10} />);
    expect(screen.getByText('-10+')).toBeInTheDocument();
  });

  it('يجب أن لا يظهر تأثير النبض في العرض الأول', () => {
    render(<AnimatedBadge count={5} pulseOnChange={true} />);
    
    // First render should not trigger pulse
    vi.advanceTimersByTime(100);
  });
});
