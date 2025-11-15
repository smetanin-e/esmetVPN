'use client';
import { ShieldCheck, ShieldMinus } from 'lucide-react';
import React from 'react';
import { PeersStats } from '../model/types';
import { useUserSession } from '@/features/auth/model/hooks/use-session';
import { UserRole } from '@prisma/client';

interface Props {
  className?: string;
  userId?: string;
  isLoading: boolean;
  stats: PeersStats[];
  adminPage?: boolean;
}

export const PeersQuantity: React.FC<Props> = ({ isLoading, stats, adminPage }) => {
  const { user } = useUserSession();

  if (isLoading) {
    return <div>загрузка...</div>;
  }

  const peerStats =
    user?.role === UserRole.ADMIN && adminPage
      ? stats.reduce(
          (acc, curr) => ({
            active: acc.active + curr.active,
            disabled: acc.disabled + curr.disabled,
            total: acc.total + curr.total,
          }),
          { active: 0, disabled: 0, total: 0 },
        )
      : stats.find((item) => item.userId === Number(user?.id));

  return (
    <>
      <div className='flex items-center space-x-2 text-green-300  '>
        <ShieldCheck className='h-4 w-4' />
        <p className=' font-bold '>{peerStats?.active}</p>
      </div>

      <div className='flex items-center space-x-2 text-red-400  '>
        <ShieldMinus className='h-4 w-4' />
        <p className=' font-bold '>{peerStats?.disabled}</p>
      </div>
    </>
  );
};
