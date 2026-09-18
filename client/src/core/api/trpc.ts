import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../../server/routers/routers';

export const trpc = createTRPCReact<AppRouter>();

// Create standalone client for use outside React context
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_APP_ID ? `${import.meta.env.VITE_APP_ID}/trpc` : '/trpc',
      transformer: superjson,
    }),
  ],
});
