import { clientAxiosInstance } from '@/shared/service/instance';
import { SubscriptionPlan } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export const useGetSubscriptionPlans = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      return (await clientAxiosInstance.get<SubscriptionPlan[]>('/api/subscription-plan')).data;
    },
  });
};
