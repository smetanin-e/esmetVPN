import { WireGuardPeerResponse } from '@/features/wg-peer/model/types';
import { prisma } from '@/shared/lib/prisma';
import { WgPeerStatus } from '@prisma/client';
import { peerApi } from '../api/peer.api';
import { normalizeWgConfig } from '../lib/normalize-config';

const basePeerSelect = {
  id: true,
  peerName: true,
  status: true,
  user: { select: { id: true, login: true, firstName: true, lastName: true } },
};

export const peerRepository = {
  //=============== БД методы ====================

  //Получаем пиры из БД по userId
  async getPeersByUserId(userId: number, take?: number, skip?: number) {
    return prisma.wireguardPeer.findMany({
      where: { userId },
      select: basePeerSelect,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  },

  //Получаем пиры из БД по поиску (логин, имя, фамилия)
  async getAllPeersFiltered(search: string, take?: number, skip?: number) {
    return prisma.wireguardPeer.findMany({
      where: search
        ? {
            user: {
              OR: [
                { lastName: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { login: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {},
      select: basePeerSelect,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  },

  //Получаем все peerId по id пользователя для комплексного отключения на сервере WG
  async getPeerIdsByUserId(userId: number) {
    const peers = await prisma.wireguardPeer.findMany({
      where: { userId },
      select: { id: true },
    });

    return peers.map((p) => p.id);
  },

  // Поиск пира по id
  async findPeerById(peerId: number) {
    return prisma.wireguardPeer.findFirst({
      where: { id: peerId },
    });
  },

  // Поиск пира по userId
  async findPeersByUserId(userId: number) {
    return prisma.wireguardPeer.findMany({
      where: { userId },
    });
  },

  async findAllBasic() {
    return prisma.wireguardPeer.findMany({
      select: { id: true, peerName: true, publicKey: true },
    });
  },

  // обновление статуса пира по id
  async updatePeerStatus(peerId: number, value: boolean) {
    const status = value ? WgPeerStatus.ACTIVE : WgPeerStatus.INACTIVE;
    return prisma.wireguardPeer.update({
      where: { id: peerId },
      data: {
        status,
      },
    });
  },

  //Получаем активные peerId по id пользователя для комплексного отключения на сервере WG
  async getEnabledPeerIdsByUserId(userId: number) {
    const peers = await prisma.wireguardPeer.findMany({
      where: { userId, isEnabled: true },
      select: { id: true },
    });
    return peers.map((p) => p.id);
  },

  //деактивируем или активируем все пиры пользователя
  async changePeersStatusByUserId(userId: number, value: boolean) {
    const where = value ? { userId, isEnabled: true } : { userId };
    const status = value ? WgPeerStatus.ACTIVE : WgPeerStatus.INACTIVE;

    return prisma.wireguardPeer.updateMany({
      where,
      data: { status },
    });
  },

  //обновляем флаг последнего статуса пира (для того чтобы при активации пользователя, включить ему только те пиры, которые были активны до блокировки)
  async updateLabelPeerStatus(peerId: number, value: boolean) {
    return prisma.wireguardPeer.update({
      where: { id: peerId },
      data: {
        isEnabled: value,
      },
    });
  },

  //Удаляем пир
  async deletePeer(peerId: number) {
    return prisma.wireguardPeer.delete({
      where: { id: peerId },
    });
  },

  //Удаляем все пиры пользователя
  async deletePeersByUserId(userId: number) {
    return prisma.wireguardPeer.deleteMany({
      where: { userId },
    });
  },

  //добавляем пир из wg-rest-api в базу данных
  async createPeerDb(
    userId: number,
    name: string,
    peerId: number,
    publicKey: string,
    privateKey: string,
    address: string,
  ) {
    return prisma.wireguardPeer.create({
      data: {
        userId,
        peerName: name,
        publicKey,
        privateKey,
        address,
        id: peerId,
        status: WgPeerStatus.ACTIVE,
        isEnabled: true,
      },
    });
  },

  //Считаем количество пиров для пользователя
  async count(userId: number) {
    const [activeCount, totalCount] = await Promise.all([
      prisma.wireguardPeer.count({
        where: { userId, status: WgPeerStatus.ACTIVE },
      }),
      prisma.wireguardPeer.count({ where: { userId } }),
    ]);

    return [{ userId, active: activeCount, disabled: totalCount - activeCount, total: totalCount }];
  },

  //Считаем количество пиров для администратора
  async countAllUsers() {
    const peers = await prisma.wireguardPeer.groupBy({
      by: ['userId', 'status'],
      _count: { _all: true },
    });

    const result = peers.reduce((acc, p) => {
      const existing = acc.get(p.userId) || { active: 0, disabled: 0, total: 0 };

      if (p.status === WgPeerStatus.ACTIVE) {
        existing.active += p._count._all;
      } else {
        existing.disabled += p._count._all;
      }

      existing.total += p._count._all;
      acc.set(p.userId, existing);

      return acc;
    }, new Map<number, { active: number; disabled: number; total: number }>());

    return Array.from(result.entries()).map(([userId, stats]) => ({
      userId,
      ...stats,
    }));
  },

  //Считаем количество активных пиров пользователя
  async countActivePeers(userId: number) {
    return prisma.wireguardPeer.count({ where: { userId, status: WgPeerStatus.ACTIVE } });
  },

  //считаем пиры, которые были активны последние 24 часа
  async countPeersLast24h(userId: number, since: Date) {
    return prisma.wireguardPeer.count({ where: { userId, lastActivity: { gte: since } } });
  },

  //Обновляем последнюю активность пира. (Обновляем 1 раз перед списанием средств)
  async updateLastActivity(peerId: number, lastActivity: Date) {
    return prisma.wireguardPeer.update({
      where: { id: peerId },
      data: { lastActivity },
    });
  },

  //================= wg-rest-api методы ==============================

  //Создаём пира через wg-rest-api
  async createPeerWgServer(name: string): Promise<WireGuardPeerResponse | null> {
    try {
      const res = await peerApi.create(name);
      return res.data;
    } catch (error) {
      console.error('[createPeerWgServer] Server error', error);
      return null;
    }
  },

  // Получаем конфиг напрямую из wg-rest-api
  async getWgServerPeerConfig(peerId: number): Promise<string | null> {
    try {
      const res = await peerApi.downloadPeerConfig(peerId);
      return normalizeWgConfig(res.data);
    } catch (error) {
      console.error('[getWgServerPeerConfig] Server error', error);
      return null;
    }
  },

  async getLastHandshake(peerId: number): Promise<Date | null> {
    try {
      const { data } = await peerApi.getConfigById(peerId);
      if (!data?.last_online) return null;
      const lastOnline = new Date(data.last_online);
      return isNaN(lastOnline.getTime()) ? null : lastOnline;
    } catch (err) {
      console.error(`[peerRepository] Ошибка получения lastHandshake (${peerId})`, err);
      return null;
    }
  },
};
