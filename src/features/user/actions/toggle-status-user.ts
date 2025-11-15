'use server';
import { userSubscriptionRepository } from '@/entities/user-subscription/repository/user-subscription-repository';
import { userRepository } from '@/entities/user/repository/user-repository';
import { getUserSession } from '@/features/user/actions/get-user-session';
import { updateUserPeersStatus } from '@/features/wg-peer/actions/update-user-peers-status';

export const toggleUserStatusAction = async (userId: number) => {
  try {
    const authUser = await getUserSession();
    if (!authUser || authUser.id === userId) {
      return { success: false, message: 'Нельзя отключить учетную запись текущего пользователя' };
    }
    const user = await userRepository.findUserById(userId);
    if (!user) return { success: false, message: 'Пользователь не найден' };

    const userSubscription = await userSubscriptionRepository.findByUserId(user.id);
    if (!userSubscription) {
      await userRepository.toggleUserStatus(userId, !user.status);
      return { success: true };
    }

    const newStatus = !user.status;

    //обрабатываем пиры
    await updateUserPeersStatus(user.id, newStatus);

    //обрабатываем подписку пользователя
    await userSubscriptionRepository.changeStatus(user.id, newStatus);

    //меняем статус пользователя
    await userRepository.toggleUserStatus(user.id, newStatus);

    return { success: true };
  } catch (error) {
    console.error('[TOGGLE_STATUS_USER] Server error', error);
    return { success: false, message: 'Ошибка изменения статуса пользователя' };
  }
};
