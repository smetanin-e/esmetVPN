import { subscriptionPlanRepository } from '@/entities/subscription-plan/repository/subscription-plan-repository';
import { validateApiToken } from '@/shared/lib/validate-api-token';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (!validateApiToken(req)) {
    return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 401 });
  }
  try {
    const subscriptionPlans = await subscriptionPlanRepository.getPlans();
    return NextResponse.json(subscriptionPlans);
  } catch (error) {
    console.error('[API_SUBSCRIPTION_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
