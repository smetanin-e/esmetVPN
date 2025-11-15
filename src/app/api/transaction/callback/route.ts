import { transactionRepository } from '@/entities/transaction/repository/transaction-repository';
import { userSubscriptionRepository } from '@/entities/user-subscription/repository/user-subscription-repository';
import { userRepository } from '@/entities/user/repository/user-repository';
import { updateUserPeersStatus } from '@/features/wg-peer/actions/update-user-peers-status';
import { PaymentCallbackData } from '@/shared/types/youkassa.type';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    //получаем запрос от Юкасса
    const body = (await req.json()) as PaymentCallbackData;

    //Ищем транзакцию по transactionId, который пришел с ответом Юкассы
    const transaction = await transactionRepository.findById(
      Number(body.object.metadata.transactionId),
    );
    if (!transaction) {
      return NextResponse.json({ error: 'Транзакция не найдена' });
    }

    if (Number(body.object.amount.value) !== transaction.amount) {
      return NextResponse.json({ error: 'Поблемы с суммой пополнения' }, { status: 400 });
    }

    //Сохраняем ответ статуса транзакции
    const isSucceeded = body.object.status === 'succeeded';

    //обновляем статус транзакции
    const status = isSucceeded ? OrderStatus.SUCCEEDED : OrderStatus.CANCELED;
    await transactionRepository.updateAfterPayment(transaction.id, status, body.object.id);

    //Обновляем баланс пользователю
    if (isSucceeded) {
      const user = await userRepository.findUserById(transaction.userId);
      if (!user) {
        return NextResponse.json({ error: 'Пользователь не найден' });
      }

      await userRepository.incrementBalance(user.id, transaction.amount);
      if (user.balance + transaction.amount > 0) {
        await userSubscriptionRepository.changeStatus(user.id, true);

        //активируем пиры
        await updateUserPeersStatus(user.id, true);
      }

      return new Response('OK', { status: 200 });
    }
  } catch (error) {
    console.error('[API_TRANSACTION_CALLBACK] Server error', error);
    return NextResponse.json({ error: 'Server error' });
  }
}
