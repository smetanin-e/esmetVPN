'use client';
import React from 'react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';
import { Laptop, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CardLabel } from '@/shared/components';
import { UserSubscriptionDTO } from '@/entities/user-subscription/model/types';
import { PaymentModal } from '@/entities/transaction/ui';
import { calculateUserPrices } from '@/shared/lib';

interface Props {
  className?: string;
  subscription: UserSubscriptionDTO;
  balance: number;
}

export const ClientSubscriptionCard: React.FC<Props> = ({ className, subscription, balance }) => {
  const prices = calculateUserPrices(
    subscription.subscriptionPlan.dailyPrice,
    subscription.subscriptionPlan.maxPeers,
  );

  //   const subsEnd = subscription.endDate
  //     ? new Date(subscription.endDate).toLocaleDateString('ru-RU')
  //     : 'Дата не определена';

  return (
    <Card
      className={cn(
        'bg-slate-800/50 border-blue-600 backdrop-blur-sm relative max-w-full',
        className,
      )}
    >
      <CardLabel text='Моя подписка' />

      <CardHeader>
        <CardTitle className=' flex items-center justify-between'>
          <span className='text-lg'>{subscription.subscriptionPlan.name}</span>
          <Badge variant={subscription.status ? 'success' : 'destructive'}>
            {subscription.status ? 'Активна' : 'Отключена'}
          </Badge>
        </CardTitle>
        <CardDescription className='text-slate-300'>
          <ul>
            <li className='flex items-center gap-2  text-lg'>
              <Smartphone className='h-4 w-4 text-green-400' />
              <Laptop className='h-4 w-4 text-green-400' />
              <Monitor className='h-4 w-4 text-green-400' />
              устройств - {subscription.subscriptionPlan.maxPeers}
            </li>
          </ul>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscription.subscriptionPlan.label === 'FREE' ? (
          <></>
        ) : (
          <>
            <ul className='md:h-[134px] overflow-y-scroll'>
              {' '}
              {prices.map((price, index) => (
                <li className='mt-2 text-sm' key={index}>{`Активных устройств: ${
                  index + 1
                } - списание ${price} ₽ в сутки`}</li>
              ))}
            </ul>

            <div className='mt-2 space-y-4'>
              <p className='text-xl text-slate-400'>
                Баланс:{' '}
                <span
                  className={cn(
                    balance <= 0 ? 'text-red-500' : 'text-success',
                    'text-2xs font-bold',
                  )}
                >{`₽ ${balance ? balance : 0}`}</span>
              </p>
              <PaymentModal />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
