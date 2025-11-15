import { formatDate } from '@/shared/lib';
import { TransactionType, UserRole } from '@prisma/client';
import React from 'react';
import { TransactionDTO } from '../model/types';

interface Props {
  className?: string;
  icon: React.ReactNode;
  transaction: TransactionDTO;
  userRole?: UserRole | undefined;
}

export const TransactionItem: React.FC<Props> = ({ icon, transaction, userRole }) => {
  return (
    <div className='flex items-start gap-3'>
      {icon}
      <div className='flex-1'>
        <div className='text-sm text-white'>
          {transaction.type === TransactionType.TOP_UP
            ? `Пополнение счета в размере - ${transaction.amount} ₽`
            : `Списание средств в размере - ${transaction.amount} ₽`}
        </div>
        {userRole === 'ADMIN' && (
          <div className='text-sm text-white'> {`Пользователь: ${transaction.user.login}`}</div>
        )}

        <div className='text-xs text-slate-400'>
          {formatDate(transaction.createdAt.toLocaleString())}
        </div>
      </div>
    </div>
  );
};
