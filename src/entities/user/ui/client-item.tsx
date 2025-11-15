import React from 'react';
import { Send } from 'lucide-react';
import { PeersQuantity } from '@/shared/components';
import { Badge, Button } from '@/shared/components/ui';
import Link from 'next/link';
import { UserDTO } from '../model/types';
import { PeersStats } from '@/entities/wg-peer';
import { ChangeUserStatus, DeleteUser } from '@/features/user';

interface Props {
  className?: string;
  user: UserDTO;
  stats: PeersStats[];
  isLoading: boolean;
}

export const ClientItem: React.FC<Props> = ({ user, stats, isLoading }) => {
  const peerStats = stats.find((item) => item.userId === user?.id) ?? {
    userId: user.id,
    active: 0,
    disabled: 0,
    total: 0,
  };

  if (user.login === 'Admin') return null;
  return (
    <div className='space-y-4'>
      <div className='p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors'>
        <div className='flex items-center justify-between mb-4'>
          <p className=' text-sm'>{`${user.lastName} ${user.firstName}`}</p>
          <Badge variant={user.userSubscription?.status ? 'success' : 'destructive'}>
            {user.userSubscription?.subscriptionPlan.name}
          </Badge>
        </div>
        <div className='sm:flex sm:items-center sm:justify-between sm:space-x-2'>
          <div>
            <div className='flex items-center justify-between sm:block '>
              <p>Логин: {user.login}</p>
              <p>Баланс: {user.balance}</p>
            </div>
          </div>

          <div className='flex items-center justify-between space-x-6 mt-4 sm:mt-0'>
            <Link href={user.telegram} target='_blank'>
              <Button
                size={'sm'}
                className='bg-blue-500 text-white rounded-full h-8 w-8 hover:bg-blue-400 hover:text-white'
              >
                <Send />
              </Button>
            </Link>
            <div className='flex space-x-2'>
              <PeersQuantity isLoading={isLoading} stats={[peerStats]} adminPage={true} />
            </div>

            <ChangeUserStatus userId={user.id} status={user.status} />

            <div className='flex items-center gap-4'>
              <DeleteUser userId={user.id} userName={`${user.lastName} ${user.firstName}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
