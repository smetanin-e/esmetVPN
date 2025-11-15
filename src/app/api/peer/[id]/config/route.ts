import { userRepository } from '@/entities/user';
import { peerRepository } from '@/entities/wg-peer/repository/peer-repository';
import { getUserSession } from '@/features/user/actions/get-user-session';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const peerId = Number((await params).id);

    const authUser = await getUserSession();
    if (!authUser)
      return NextResponse.json({ error: 'Пользователь не авторизован' }, { status: 401 });

    const peer = await peerRepository.findPeerById(peerId);

    if (!peer)
      return NextResponse.json({ error: 'Файлы vpn конфигурацый не найдены' }, { status: 404 });

    const user = await userRepository.findUserById(peer.userId);
    if (!user)
      return NextResponse.json(
        { error: 'Для данного пира отсутствует пользователь' },
        { status: 404 },
      );

    if (authUser.role === UserRole.ADMIN || user.id === authUser.id) {
      // Получаем конфиг напрямую из wg-rest-api
      const config = await peerRepository.getWgServerPeerConfig(peerId);
      if (!config) {
        return NextResponse.json({
          success: false,
          message: 'Не удалось запросить конфиг. Ошибка на сервере WG',
        });
      }

      return new NextResponse(config, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${peer.peerName}.conf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 404 });
  } catch (error) {
    console.error('[API_VPN_CONFIG]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
