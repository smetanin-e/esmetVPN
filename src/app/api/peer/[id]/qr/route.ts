import { userRepository } from '@/entities/user';
import { peerRepository } from '@/entities/wg-peer/repository/peer-repository';
import { getUserSession } from '@/features/user/actions/get-user-session';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

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

      // Генерируем QR в base64 (PNG)
      const qr = await QRCode.toDataURL(config, { errorCorrectionLevel: 'L' });

      // Возвращаем как изображение
      const base64 = qr.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="${peer.peerName}.png"`,
        },
      });
    }
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 404 });
  } catch (error) {
    console.error('[API_VPN_CONFIG_QR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
