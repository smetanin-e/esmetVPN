'use server';
import { userSubscriptionRepository } from '@/entities/user-subscription/repository/user-subscription-repository';
import { userRepository } from '@/entities/user/repository/user-repository';
import { getUserSession } from '@/features/user/actions/get-user-session';
import { deleteUserPeers } from '@/features/wg-peer/actions/delete-user-peers';

export const deleteUserAction = async (userId: number) => {
  try {
    const authUser = await getUserSession();
    if (!authUser || authUser.id === userId) {
      return { success: false, message: 'Нельзя отключить учетную запись текущего пользователя' };
    }

    const user = await userRepository.findUserById(userId);
    if (!user) return { success: false, message: 'Пользователь не найден' };

    //удаляем пиры
    await deleteUserPeers(user.id);

    //удаляем транзакции (удалятся вместе с user так как в схеме user onDelete: Cascade)

    //Удаляем подписку
    const subscription = await userSubscriptionRepository.findByUserId(user.id);
    if (subscription) {
      await userSubscriptionRepository.deleteByUserId(user.id);
    }

    //Удаляем пользователя
    await userRepository.deleteUser(user.id);

    return { success: true };
  } catch (error) {
    console.error('[DELETE_USER] Server error', error);
    return { success: false, message: 'Ошибка удаления пользователя' };
  }
};
