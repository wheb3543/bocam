import { trpc } from '@/lib/api/trpc';
import { UNAUTHED_ERR_MSG } from './const';
import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { createRoot } from 'react-dom/client';
import superjson from 'superjson';
import App from './App';
import { getLoginUrl, getLocalLoginUrl } from './const';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === 'undefined') return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

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
