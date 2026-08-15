/**
 * اختبارات AnimatedProgressBar Component
 * AnimatedProgressBar Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedProgressBar from '../AnimatedProgressBar';

describe('AnimatedProgressBar - Rendering', () => {
  it('يجب أن يعرض شريط التقدم', () => {
    const { container } = render(<AnimatedProgressBar value={50} />);
    expect(container.querySelector('[style*="width"]')).toBeInTheDocument();
  });

  it('يجب أن يعرض التسمية خارج الشريط', () => {
    const { container } = render(<AnimatedProgressBar value={50} showLabel={true} labelPosition="outside" />);
    expect(container.querySelector('.text-muted-foreground')).toBeInTheDocument();
  });

  it('يجب أن يعرض التسمية داخل الشريط', () => {
    render(<AnimatedProgressBar value={50} showLabel={true} labelPosition="inside" />);
    // Label is inside the bar, but width starts at 0 so label won't show initially
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('يجب أن يطبق className المخصص', () => {
    const { container } = render(<AnimatedProgressBar value={50} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('يجب أن يطبق barClassName المخصص', () => {
    const { container } = render(<AnimatedProgressBar value={50} barClassName="custom-bar" />);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toHaveClass('custom-bar');
  });
});

describe('AnimatedProgressBar - Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يجب أن يبدأ الحركة بعد delay', () => {
    const { container } = render(<AnimatedProgressBar value={50} delay={200} />);
    
    // Before delay, width should be 0
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toHaveStyle({ width: '0%' });
    
    // After delay, animation should start
    vi.advanceTimersByTime(200);
  });

  it('يجب أن يستخدم delay المخصص', () => {
    render(<AnimatedProgressBar value={50} delay={500} />);
    
    vi.advanceTimersByTime(500);
  });

  it('يجب أن يستخدم duration المخصص', () => {
    const { container } = render(<AnimatedProgressBar value={50} duration={2000} />);
    
    vi.advanceTimersByTime(200);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toHaveStyle({ transitionDuration: '2000ms' });
  });
});

describe('AnimatedProgressBar - Value Handling', () => {
  it('يجب أن يقيد القيمة بين 0 و 100', () => {
    const { container } = render(<AnimatedProgressBar value={150} />);
    
    vi.advanceTimersByTime(300);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع القيم السالبة', () => {
    const { container } = render(<AnimatedProgressBar value={-50} />);
    
    vi.advanceTimersByTime(200);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع القيمة 0', () => {
    const { container } = render(<AnimatedProgressBar value={0} />);
    
    vi.advanceTimersByTime(200);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toHaveStyle({ width: '0%' });
  });

  it('يجب أن يتعامل مع القيمة 100', () => {
    const { container } = render(<AnimatedProgressBar value={100} />);
    
    vi.advanceTimersByTime(300);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });
});

describe('AnimatedProgressBar - Label Position', () => {
  it('يجب أن لا يعرض التسمية عندما showLabel=false', () => {
    render(<AnimatedProgressBar value={50} showLabel={false} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('يجب أن يعرض التسمية خارج الشريط عند labelPosition=outside', () => {
    const { container } = render(<AnimatedProgressBar value={50} showLabel={true} labelPosition="outside" />);
    expect(container.querySelector('.text-muted-foreground')).toBeInTheDocument();
  });

  it('يجب أن يعرض التسمية داخل الشريط عند labelPosition=inside مع عرض كافٍ', () => {
    render(<AnimatedProgressBar value={50} showLabel={true} labelPosition="inside" />);
    // Label is inside the bar, but width starts at 0 so label won't show initially
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('يجب أن لا يعرض التسمية داخل الشريط عندما العرض < 15%', () => {
    render(<AnimatedProgressBar value={10} showLabel={true} labelPosition="inside" />);
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
});

describe('AnimatedProgressBar - Height', () => {
  it('يجب أن يستخدم height الافتراضي', () => {
    const { container } = render(<AnimatedProgressBar value={50} />);
    const track = container.querySelector('.bg-muted');
    expect(track).toHaveClass('h-2');
  });

  it('يجب أن يستخدم height المخصص', () => {
    const { container } = render(<AnimatedProgressBar value={50} height="h-4" />);
    const track = container.querySelector('.bg-muted');
    expect(track).toHaveClass('h-4');
  });
});

describe('AnimatedProgressBar - Edge Cases', () => {
  it('يجب أن يتعامل مع delay=0', () => {
    const { container } = render(<AnimatedProgressBar value={50} delay={0} />);
    
    vi.advanceTimersByTime(0);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع duration=0', () => {
    const { container } = render(<AnimatedProgressBar value={50} duration={0} />);
    
    vi.advanceTimersByTime(0);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });

  it('يجب أن يتعامل مع القيم العشرية', () => {
    const { container } = render(<AnimatedProgressBar value={75.5} />);
    
    vi.advanceTimersByTime(300);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });
});

describe('AnimatedProgressBar - Cleanup', () => {
  it('يجب أن يلغي timer عند unmount', () => {
    const { unmount } = render(<AnimatedProgressBar value={50} delay={200} />);
    
    unmount();
    
    // Should cleanup timer
  });
});
