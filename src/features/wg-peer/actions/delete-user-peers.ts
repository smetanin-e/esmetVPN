'use server';

import { peerApi, peerRepository } from '@/entities/wg-peer';

export async function deleteUserPeers(userId: number) {
  const peerIds = await peerRepository.getPeerIdsByUserId(userId);
  if (!peerIds.length) return;

  try {
    //удаляем с сервера wg
    await peerApi.deleteMany(peerIds);
    //удаляем с БД
    await peerRepository.deletePeersByUserId(userId);
  } catch (error) {
    console.error('[deleteUserPeers]', error);
    throw error;
  }
}
