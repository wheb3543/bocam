import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from './const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl, getLocalLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

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

trpc.client.setLink(() =>
  httpBatchLink({
    url: '/api/trpc',
    headers: () => {
      const cookie = document.cookie;
      return {
        cookie,
      };
    },
  })
);

// Global error handler for unauthorized errors
trpc.useQuery(['example'], () => ({ data: null }), {
  onError: redirectToLoginIfUnauthorized,
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
