import { clientAxiosInstance } from '@/shared/service/instance';
import { useQuery } from '@tanstack/react-query';
import { UserDTO } from '../model/types';

export const useGetUsers = () => {
  const query = useQuery<UserDTO[]>({
    queryKey: ['users'],
    queryFn: async () => {
      return (await clientAxiosInstance.get<UserDTO[]>('/api/user')).data;
    },
  });

  return {
    ...query,
    users: query.data ?? [],
  };
};
