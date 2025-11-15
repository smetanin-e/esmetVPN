'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui';
import { CircleDollarSign, CreditCard } from 'lucide-react';
import { CardLabel, EmptyData, LoadingBounce, ShowMore } from '@/shared/components';

import { cn } from '@/shared/lib/utils';

import { TransactionType, UserRole } from '@prisma/client';
import { useGetTransactions } from '@/entities/transaction/model';
import { TransactionItem } from '@/entities/transaction/ui';

interface Props {
  className?: string;
  userRole?: UserRole | undefined;
}

export const Transactions: React.FC<Props> = ({ className, userRole }) => {
  const { data, hasNextPage, isLoading, fetchNextPage, isFetchingNextPage } = useGetTransactions();
  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  return (
    <Card
      className={cn('bg-slate-800/50 border-slate-700 backdrop-blur-sm pb-1 relative', className)}
    >
      <CardLabel text='Tранзакции' />

      <CardHeader>
        <CardTitle className='text-white'>Транзакции</CardTitle>
        <CardDescription className='text-slate-300'>
          Фиксация пополнений и ежедневных списаний
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          userRole === UserRole.ADMIN ? 'md:h-[440px]' : 'md:h-[240px]',
          'space-y-2 relative  min-h-[240px]',
        )}
      >
        {/* <EmptyData text='Нет транзакций' /> */}
        {isLoading ? (
          <LoadingBounce />
        ) : (
          <>
            {transactions.length === 0 ? (
              <EmptyData text='Транзакции отсутствуют' />
            ) : (
              <div
                className={cn(
                  userRole === 'ADMIN' ? 'md:h-[380px]' : 'md:h-[180px]',
                  'space-y-4 overflow-y-scroll',
                )}
              >
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    icon={
                      transaction.type === TransactionType.TOP_UP ? (
                        <CreditCard className='h-4 w-4 text-green-400' />
                      ) : (
                        <CircleDollarSign className='h-4 w-4 text-red-400' />
                      )
                    }
                    transaction={transaction}
                    userRole={userRole}
                  />
                ))}
              </div>
            )}
          </>
        )}
        {hasNextPage && <ShowMore onClick={() => fetchNextPage()} disabled={isFetchingNextPage} />}
      </CardContent>
    </Card>
  );
};
