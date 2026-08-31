export function getSafeNavigationTarget(target?: string | null): string | null {
  const value = target?.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith('/') || value.startsWith('#')) {
    return value;
  }

  if (/^(mailto:|tel:)/i.test(value)) {
    return value;
  }

  if (/^javascript:/i.test(value) || /^data:/i.test(value)) {
    return null;
  }

  try {
    const parsed = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? value : null;
  } catch {
    return null;
  }
}

export function safeNavigate(target?: string | null): boolean {
  const safeTarget = getSafeNavigationTarget(target);
  if (!safeTarget) {
    return false;
  }

  window.location.href = safeTarget;
  return true;
}
