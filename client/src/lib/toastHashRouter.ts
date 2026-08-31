export type ToastHashKind = 'success' | 'error' | 'info' | 'warning';

export type ToastHashPayload = {
  kind: ToastHashKind;
  message?: string;
  description?: string;
  redirect?: string;
  autoNavigate?: boolean;
};

const isSafeRedirect = (value?: string) => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('javascript:')) {
    return false;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    return url.origin === window.location.origin || trimmed.startsWith('/');
  } catch {
    return false;
  }
};

export const parseToastHash = (hash: string): ToastHashPayload | null => {
  if (!hash) {
    return null;
  }

  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const match = raw.match(/^\/toast\/(success|error|info|warning)(?:\?.*)?$/i);
  if (!match) {
    return null;
  }

  const kind = match[1].toLowerCase() as ToastHashKind;
  const queryString = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
  const params = new URLSearchParams(queryString);

  const message = params.get('message') ?? undefined;
  const description = params.get('description') ?? undefined;
  const redirect = params.get('redirect') ?? undefined;
  const autoNavigate = params.get('autoNavigate') === 'true';

  if (!message && !description) {
    return null;
  }

  return {
    kind,
    message: message ?? undefined,
    description: description ?? undefined,
    redirect: isSafeRedirect(redirect) ? redirect : undefined,
    autoNavigate: autoNavigate || !!redirect,
  };
};

export const consumeToastHash = (): ToastHashPayload | null => {
  const payload = parseToastHash(window.location.hash);
  if (!payload) {
    return null;
  }

  window.history.replaceState({}, '', window.location.pathname + window.location.search);
  return payload;
};

export const buildToastHash = (payload: ToastHashPayload): string => {
  const params = new URLSearchParams();

  if (payload.message) {
    params.set('message', payload.message);
  }
  if (payload.description) {
    params.set('description', payload.description);
  }
  if (payload.redirect) {
    params.set('redirect', payload.redirect);
  }
  if (payload.autoNavigate !== undefined) {
    params.set('autoNavigate', String(payload.autoNavigate));
  }

  return `#/toast/${payload.kind}?${params.toString()}`;
};

export const emitToastHash = (payload: ToastHashPayload) => {
  if (typeof window === 'undefined') {
    return;
  }

  const nextHash = buildToastHash(payload);
  window.location.hash = nextHash;
};

export const navigateWithToast = (
  navigate: (path: string) => void,
  payload: ToastHashPayload,
  fallbackPath?: string
) => {
  const safeRedirect = payload.redirect ?? fallbackPath;
  if (safeRedirect && isSafeRedirect(safeRedirect)) {
    navigate(safeRedirect);
    return;
  }

  if (fallbackPath && isSafeRedirect(fallbackPath)) {
    navigate(fallbackPath);
  }
};
