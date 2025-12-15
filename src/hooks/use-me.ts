import { useQuery } from '@tanstack/react-query';
import { fetchMe, Me } from '@/lib/fetcher/api';
import { qk } from '@/lib/react-query/keys';

export function useMe() {
  return useQuery<Me>({ queryKey: qk.me, queryFn: fetchMe, staleTime: 60_000 });
}
