'use client';
import React from 'react';
import { cn } from '@/shared/lib/utils';
import { UserRole } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui';
import { PeerItem, SearchPeer } from '@/entities/wg-peer/ui';
import { EmptyData, LoadingBounce, PeersQuantity, ShowMore } from '@/shared/components';
import { useGetPeers, usePeersStats } from '@/entities/wg-peer/model/hooks';
import { CreatePeerModal } from '@/features/wg-peer/ui';

interface Props {
  className?: string;
  label: React.ReactNode;
  userRole: UserRole;
}

export const Peers: React.FC<Props> = ({ className, label, userRole }) => {
  const [searchValue, setSearchValue] = React.useState('');
  const { data, status, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetPeers(searchValue);
  const peers = data?.pages.flatMap((page) => page.peers) ?? [];

  const { data: peerStats, isLoading } = usePeersStats();
  const stats = peerStats ?? [];

  if (status === 'error') {
    return (
      <div className='p-4 text-red-500'>
        Ошибка: {error instanceof Error ? error.message : 'Не удалось получить список пиров ❌'}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'bg-slate-800/50 border-blue-600 backdrop-blur-sm relative  max-w-full min-h-80',
        className,
      )}
    >
      {label}
      {status === 'pending' ? (
        <LoadingBounce />
      ) : (
        <>
          <CardHeader className='mb-0 pb-0'>
            <CardTitle>Конфигурация WireGuard</CardTitle>
            <div className='sm:flex sm:items-center sm:justify-between sm:space-x-6 text-sm flex-wrap md:flex-nowrap space-y-4 sm:space-y-0'>
              <div className='flex space-x-6'>
                <PeersQuantity
                  isLoading={isLoading}
                  stats={stats}
                  adminPage={userRole === UserRole.ADMIN}
                />
              </div>

              {userRole === UserRole.ADMIN && (
                <SearchPeer searchValue={searchValue} setSearchValue={setSearchValue} />
              )}
              {userRole === UserRole.USER && <CreatePeerModal />}
            </div>
          </CardHeader>
          {peers.length === 0 ? (
            <EmptyData text='Нет конфигураций' />
          ) : (
            <CardContent className='space-y-2 p-1'>
              {peers.map((peer) => (
                <PeerItem key={peer.id} peer={peer} />
              ))}

              {hasNextPage && (
                <ShowMore onClick={() => fetchNextPage()} disabled={isFetchingNextPage} />
              )}
            </CardContent>
          )}
        </>
      )}
    </Card>
  );
};
