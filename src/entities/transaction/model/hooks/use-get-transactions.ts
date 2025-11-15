import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchTransactions } from '../../api/fetch-transactions';

export const useGetTransactions = () => {
  return useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: ({ pageParam = 0 }) => fetchTransactions({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};
