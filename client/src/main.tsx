import { trpc } from '@/lib/api/trpc';
import { UNAUTHED_ERR_MSG } from './const';
import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { createRoot } from 'react-dom/client';
import superjson from 'superjson';
import App from './App';
import { getLoginUrl, getLocalLoginUrl } from './const';
import './index.css';

// Clear cache and service workers on reload to prevent stale content
if (typeof window !== 'undefined') {
  // Unregister any service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  // Clear any caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reload')) {
    // Clear URL parameter without triggering a reload
    const newUrl = window.location.pathname + window.location.search.replace(/[?&]reload=true/, '').replace(/^&/, '?');
    window.history.replaceState({}, '', newUrl);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) {return;}
  if (typeof window === 'undefined') {return;}

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) {return;}

  const currentPath = window.location.pathname;
  const adminLoginUrl = getLocalLoginUrl();
  const loginUrl = getLoginUrl();

  // Redirect to login page if not already there
  if (currentPath !== adminLoginUrl && currentPath !== '/login') {
    window.location.href = loginUrl;
  }
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
      headers: () => {
        const cookie = typeof window !== 'undefined' ? document.cookie : '';
        return {
          cookie,
        };
      },
    }),
  ],
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <App />
    </trpc.Provider>
  );
}
