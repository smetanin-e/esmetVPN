'use server';
import { userSubscriptionRepository } from '@/entities/user-subscription/repository/user-subscription-repository';
import { userRepository } from '@/entities/user/repository/user-repository';
import { peerApi } from '@/entities/wg-peer';
import { peerRepository } from '@/entities/wg-peer/repository/peer-repository';
import { WgPeerStatus } from '@prisma/client';

type TogglePeerData = {
  peerId: number;
  userId: number;
};

export async function togglePeerStatusAction(data: TogglePeerData) {
  try {
    const user = await userRepository.findUserById(data.userId);
    if (!user || !user.status) {
      return { success: false, message: 'Пользователь не найден или заблокирован' };
    }

    const peer = await peerRepository.findPeerById(data.peerId);
    if (!peer) {
      return { success: false, message: 'Конфигурация не найдена' };
    }

    const subscription = await userSubscriptionRepository.findByUserId(data.userId);
    if (!subscription || !subscription.status) {
      return { success: false, message: 'Запрет на изменение статуса. Подписка отключена' };
    }

    const currentStatus = peer.status;
    const isDeactivating = currentStatus === WgPeerStatus.ACTIVE;

    //меняем статус на сервере WG
    await peerApi.changeEnable(peer.id, !isDeactivating);

    //обновляем БД
    await peerRepository.updateLabelPeerStatus(peer.id, !isDeactivating);
    await peerRepository.updatePeerStatus(peer.id, !isDeactivating);

    return { success: true };
  } catch (error) {
    console.error('[TOGGLE_STATUS_PEER] Server error', error);
    return { success: false, message: 'Ошибка изменения статуса' };
  }
}
