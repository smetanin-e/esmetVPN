import { userRepository } from '@/entities/user/repository/user-repository';
import { validateApiToken } from '@/shared/lib/validate-api-token';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (!validateApiToken(req)) {
    return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 401 });
  }
  try {
    const users = await userRepository.findAllUsersWithRelations();
    return NextResponse.json(users);
  } catch (error) {
    console.error('[API_SUBSCRIPTIPN_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
