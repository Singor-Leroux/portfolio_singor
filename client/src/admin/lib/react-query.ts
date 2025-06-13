import { QueryClient } from '@tanstack/react-query';

// Configuration de base pour React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export { queryClient };
export * from '@tanstack/react-query';
