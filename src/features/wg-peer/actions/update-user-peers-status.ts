'use server';

import { peerApi, peerRepository } from '@/entities/wg-peer';

export async function updateUserPeersStatus(userId: number, isActive: boolean) {
  const peerIds = await peerRepository.getEnabledPeerIdsByUserId(userId);
  if (!peerIds.length) return;

  try {
    await peerApi.changeManyEnable(peerIds, isActive);
    await peerRepository.changePeersStatusByUserId(userId, isActive);
  } catch (error) {
    console.error('[updateUserPeersStatus]', error);
    throw error;
  }
}
