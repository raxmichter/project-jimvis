import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";
import { handleBrowserTrpcFetch } from "@/lib/browser-trpc-fallback";

export const trpc = createTRPCReact<AppRouter>();

let useBrowserFallback = import.meta.env.VITE_STATIC_PROTOTYPE === "true";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        if (useBrowserFallback) {
          return handleBrowserTrpcFetch(input, init);
        }
        try {
          const response = await globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
          });
          const contentType = response.headers.get("content-type") ?? "";
          if (
            response.status === 404 ||
            response.status === 405 ||
            contentType.includes("text/html")
          ) {
            useBrowserFallback = true;
            return handleBrowserTrpcFetch(input, init);
          }
          return response;
        } catch {
          useBrowserFallback = true;
          return handleBrowserTrpcFetch(input, init);
        }
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
