/**
 * Accessibility Utilities
 * أدوات تحسين إمكانية الوصول (Accessibility)
 *
 * يوفر دوال ومساعدات لتحسين إمكانية الوصول في الواجهات
 */

/**
 * الحصول على سمات ARIA للأزرار
 */
export function getButtonAriaProps(options: {
  label?: string;
  description?: string;
  pressed?: boolean;
  expanded?: boolean;
  disabled?: boolean;
}) {
  const props: Record<string, unknown> = {
    role: 'button',
  };

  if (options.label) {
    props['aria-label'] = options.label;
  }

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  if (options.pressed !== undefined) {
    props['aria-pressed'] = options.pressed;
  }

  if (options.expanded !== undefined) {
    props['aria-expanded'] = options.expanded;
  }

  if (options.disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * الحصول على سمات ARIA للروابط
 */
export function getLinkAriaProps(options: {
  label?: string;
  description?: string;
  current?: boolean;
}) {
  const props: Record<string, unknown> = {};

  if (options.label) {
    props['aria-label'] = options.label;
  }

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  if (options.current) {
    props['aria-current'] = 'page';
  }

  return props;
}

/**
 * الحصول على سمات ARIA للصور
 */
export function getImageAriaProps(options: {
  alt: string;
  decorative?: boolean;
  description?: string;
}) {
  const props: Record<string, unknown> = {};

  if (options.decorative) {
    props.role = 'presentation';
    props.alt = '';
  } else {
    props.alt = options.alt;
  }

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  return props;
}

/**
 * الحصول على سمات ARIA للإدخال
 */
export function getInputAriaProps(options: {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  invalid?: boolean;
}) {
  const props: Record<string, unknown> = {};

  if (options.label) {
    props['aria-label'] = options.label;
  }

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  if (options.error) {
    props['aria-invalid'] = true;
    props['aria-errormessage'] = options.error;
  }

  if (options.required) {
    props['aria-required'] = true;
  }

  if (options.invalid) {
    props['aria-invalid'] = true;
  }

  return props;
}

/**
 * الحصول على سمات ARIA للقوائم
 */
export function getMenuItemAriaProps(options: {
  label?: string;
  disabled?: boolean;
  checked?: boolean | 'mixed';
}) {
  const props: Record<string, unknown> = {
    role: 'menuitem',
  };

  if (options.label) {
    props['aria-label'] = options.label;
  }

  if (options.disabled) {
    props['aria-disabled'] = true;
  }

  if (options.checked !== undefined) {
    props['aria-checked'] = options.checked;
  }

  return props;
}

/**
 * الحصول على سمات ARIA للنوافذ المنبثقة (Modals)
 */
export function getModalAriaProps(options: { label?: string; description?: string }) {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-label': options.label,
    'aria-describedby': options.description,
  };
}

/**
 * الحصول على سمات ARIA للتحذيرات
 */
export function getAlertAriaProps(options: {
  type?: 'success' | 'error' | 'warning' | 'info';
  label?: string;
}) {
  const props: Record<string, unknown> = {
    role: 'alert',
  };

  if (options.label) {
    props['aria-label'] = options.label;
  }

  if (options.type) {
    props['aria-live'] = options.type === 'error' ? 'assertive' : 'polite';
  }

  return props;
}

/**
 * التحقق من تباين الألوان (WCAG AA)
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  largeText: boolean = false
): { passes: boolean; ratio: number } {
  // تحويل HEX إلى RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return { passes: false, ratio: 0 };
  }

  // حساب نسبة التباين
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum1 = luminance(fg.r, fg.g, fg.b);
  const lum2 = luminance(bg.r, bg.g, bg.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);

  // التحقق من معايير WCAG
  const minimum = level === 'AAA' ? (largeText ? 4.5 : 7) : largeText ? 3 : 4.5;

  return {
    passes: ratio >= minimum,
    ratio: Math.round(ratio * 100) / 100,
  };
}

/**
 * الحصول على سمات التنقل بلوحة المفاتيح
 */
export function getKeyboardNavigationProps(options: {
  tabIndex?: number;
  onKeyDown?: (event: KeyboardEvent) => void;
}) {
  const props: Record<string, unknown> = {};

  if (options.tabIndex !== undefined) {
    props.tabIndex = options.tabIndex;
  }

  if (options.onKeyDown) {
    props.onKeyDown = options.onKeyDown;
  }

  return props;
}

/**
 * معالج التنقل بلوحة المفاتيح للقوائم
 */
export function handleMenuNavigation(
  event: KeyboardEvent,
  options: {
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onEnter?: () => void;
    onSpace?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }
) {
  switch (event.key) {
    case 'Escape':
      options.onEscape?.();
      event.preventDefault();
      break;
    case 'ArrowUp':
      options.onArrowUp?.();
      event.preventDefault();
      break;
    case 'ArrowDown':
      options.onArrowDown?.();
      event.preventDefault();
      break;
    case 'ArrowLeft':
      options.onArrowLeft?.();
      event.preventDefault();
      break;
    case 'ArrowRight':
      options.onArrowRight?.();
      event.preventDefault();
      break;
    case 'Enter':
      options.onEnter?.();
      event.preventDefault();
      break;
    case ' ':
      options.onSpace?.();
      event.preventDefault();
      break;
    case 'Home':
      options.onHome?.();
      event.preventDefault();
      break;
    case 'End':
      options.onEnd?.();
      event.preventDefault();
      break;
  }
}

/**
 * الحصول على سمات ARIA للحالة (Loading)
 */
export function getLoadingAriaProps(options: { label?: string; busy?: boolean }) {
  return {
    'aria-busy': options.busy ?? true,
    'aria-live': 'polite',
    'aria-label': options.label ?? 'جاري التحميل',
  };
}

/**
 * الحصول على سمات ARIA للجدول
 */
export function getTableAriaProps(options: { label?: string; description?: string }) {
  return {
    role: 'table',
    'aria-label': options.label,
    'aria-describedby': options.description,
  };
}

/**
 * الحصول على سمات ARIA للخلايا
 */
export function getTableCellAriaProps(options: {
  isHeader?: boolean;
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  colSpan?: number;
  rowSpan?: number;
}) {
  const props: Record<string, unknown> = {
    role: options.isHeader ? 'columnheader' : 'cell',
  };

  if (options.scope) {
    props.scope = options.scope;
  }

  if (options.colSpan) {
    props.colSpan = options.colSpan;
  }

  if (options.rowSpan) {
    props.rowSpan = options.rowSpan;
  }

  return props;
}

/**
 * الحصول على سمات ARIA للتبويبات (Tabs)
 */
export function getTabAriaProps(options: {
  selected?: boolean;
  controls?: string;
  label?: string;
  disabled?: boolean;
}) {
  const props: Record<string, unknown> = {
    role: 'tab',
    'aria-selected': options.selected ?? false,
  };

  if (options.controls) {
    props['aria-controls'] = options.controls;
  }

  if (options.label) {
    props['aria-label'] = options.label;
  }

  if (options.disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * الحصول على سمات ARIA لمحتوى التبويب (Tab Panel)
 */
export function getTabPanelAriaProps(options: { labelledBy?: string; hidden?: boolean }) {
  return {
    role: 'tabpanel',
    'aria-labelledby': options.labelledBy,
    hidden: options.hidden,
  };
}
