import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: () => {
        const cookie = typeof window !== 'undefined' ? document.cookie : '';
        return {
          cookie,
        };
      },
    }),
  ],
});
