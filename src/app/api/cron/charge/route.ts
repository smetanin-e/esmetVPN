import { SubscriptionService } from '@/entities/subscription';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (key !== process.env.CRON_SECRET_KEY) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const service = new SubscriptionService();
    await service.chargeAllUsers();
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
