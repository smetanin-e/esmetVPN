'use client';
import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui';
import { ClientItem } from '@/entities/user/ui/client-item';
import { cn } from '@/shared/lib/utils';

import { Plus } from 'lucide-react';
import { useGetUsers } from '@/entities/user/api/use-get-users';
import { AuthModal } from '@/widgets/auth-modal/auth-modal';
import { CardLabel, LoadingBounce } from '@/shared/components';
import { usePeersStats } from '@/entities/wg-peer/model/hooks/use-peer-stats';

interface Props {
  className?: string;
}

export const Clients: React.FC<Props> = ({ className }) => {
  const { users, isLoading } = useGetUsers();
  const { peerStats, isLoading: loadingStats } = usePeersStats();

  return (
    <Card
      className={cn(
        'bg-slate-800/50 border-blue-600 backdrop-blur-sm relative  max-w-full gap-4',
        className,
      )}
    >
      <CardLabel text='Клиенты' />
      <CardHeader className='mb-0 pb-4 flex items-center justify-between space-x-2 text-sm'>
        <CardTitle>Мои клиенты</CardTitle>

        <AuthModal
          title='Создание пользователя'
          description='Добавление нового пользователя'
          type='register'
          trigger={
            <Button type='button' variant='outline' size='sm'>
              <Plus className='w-4 h-4' />
              Создать пользователя
            </Button>
          }
        />
      </CardHeader>
      <CardContent className='space-y-2 relative h-[440px] overflow-y-scroll '>
        {isLoading ? (
          <LoadingBounce />
        ) : (
          users.map((user) => (
            <ClientItem key={user.id} user={user} stats={peerStats} isLoading={loadingStats} />
          ))
        )}
      </CardContent>
    </Card>
  );
};
