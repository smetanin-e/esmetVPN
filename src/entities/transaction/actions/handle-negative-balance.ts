'use server';

import { userSubscriptionRepository } from '@/entities/user-subscription';
import { updateUserPeersStatus } from '@/features/wg-peer/actions/update-user-peers-status';

export async function handleNegativeBalance(userId: number) {
  try {
    // Деактивируем пиры
    await updateUserPeersStatus(userId, false);
    // Деактивируем подписку
    await userSubscriptionRepository.changeStatus(userId, false);
  } catch (error) {
    console.error(
      `[handleNegativeBalance] Не удалось деактивировать пиры для пользователя ${userId}`,
      error,
    );
  }

  console.log(`Пользователь ID=${userId}, подписка отключена из-за отрицательного баланса`);
}
