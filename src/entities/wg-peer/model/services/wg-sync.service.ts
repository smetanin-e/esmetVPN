import { peerRepository } from '../../repository/peer-repository';

export class WgSyncService {
  async updatePeersActivity(): Promise<void> {
    const peers = await peerRepository.findAllBasic();

    for (const peer of peers) {
      const lastHandshake = await peerRepository.getLastHandshake(peer.id);
      if (lastHandshake) {
        await peerRepository.updateLastActivity(peer.id, lastHandshake);
      }
    }

    console.log(`✅ Обновлены активности ${peers.length} пиров`);
  }
}
