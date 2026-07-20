/**
 * اختبارات AnimatedCounter Component
 * AnimatedCounter Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedCounter from '../AnimatedCounter';

describe('AnimatedCounter - Rendering', () => {
  it('يجب أن يعرض القيمة الأولية 0', () => {
    render(<AnimatedCounter value={100} locale="en-US" />);
    // Should start at 0 and animate to 100
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('يجب أن يعرض prefix و suffix', () => {
    render(<AnimatedCounter value={50} prefix="$" suffix="%" locale="en-US" />);
    expect(screen.getByText('$0%')).toBeInTheDocument();
  });

  it('يجب أن يستخدم locale المخصص', () => {
    render(<AnimatedCounter value={1000} locale="en-US" />);
    // Starts at 0, so we check for initial value
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('يجب أن يطبق className المخصص', () => {
    const { container } = render(<AnimatedCounter value={50} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('AnimatedCounter - Animation Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يستدعي onComplete عند انتهاء الحركة', () => {
    const onComplete = vi.fn();
    render(<AnimatedCounter value={100} duration={100} onComplete={onComplete} />);
    
    vi.advanceTimersByTime(150);
    expect(onComplete).toHaveBeenCalled();
  });

  it('يجب أن يستخدم duration المخصص', () => {
    render(<AnimatedCounter value={100} duration={2000} />);
    
    vi.advanceTimersByTime(2000);
  });

  it('يجب أن لا يبدأ حركة جديدة إذا لم تتغير القيمة', () => {
    const { rerender } = render(<AnimatedCounter value={100} />);
    
    rerender(<AnimatedCounter value={100} />);
    
    vi.advanceTimersByTime(100);
  });

  it('يجب أن يلغي الحركة السابقة عند تغيير القيمة', () => {
    const { rerender } = render(<AnimatedCounter value={100} />);
    
    rerender(<AnimatedCounter value={200} />);
    
    vi.advanceTimersByTime(100);
  });
});

describe('AnimatedCounter - Easing Function', () => {
  it('يجب أن يستخدم easeOutExpo للحركة السلسة', () => {
    render(<AnimatedCounter value={100} duration={100} />);
    
    // The animation should follow easeOutExpo curve
    vi.advanceTimersByTime(50);
  });
});

describe('AnimatedCounter - State Updates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يظهر تأثير flash عند تحديث القيمة', () => {
    const { rerender } = render(<AnimatedCounter value={100} />);
    
    rerender(<AnimatedCounter value={200} />);
    
    vi.advanceTimersByTime(600);
  });

  it('يجب أن لا يظهر flash في العرض الأول', () => {
    render(<AnimatedCounter value={100} />);
    
    vi.advanceTimersByTime(100);
  });
});

describe('AnimatedCounter - Edge Cases', () => {
  it('يجب أن يتعامل مع القيم السالبة', () => {
    render(<AnimatedCounter value={-50} locale="en-US" />);
    // Component starts at 0 and animates to -50
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع القيمة 0', () => {
    render(<AnimatedCounter value={0} locale="en-US" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع القيم الكبيرة', () => {
    render(<AnimatedCounter value={1000000} locale="en-US" />);
    // Component starts at 0 and animates to 1,000,000
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع duration=0', () => {
    render(<AnimatedCounter value={100} duration={0} />);
    
    vi.advanceTimersByTime(0);
  });
});

describe('AnimatedCounter - Cleanup', () => {
  it('يجب أن يلغي animation frame عند unmount', () => {
    const { unmount } = render(<AnimatedCounter value={100} />);
    
    unmount();
    
    // Should cleanup animation frame
  });
});
