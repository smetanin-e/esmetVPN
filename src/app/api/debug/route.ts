import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    tokens: {
      INTERNAL_API_TOKEN: process.env.INTERNAL_API_TOKEN ? 'SET' : 'MISSING',
      API_READ_KEY: process.env.API_READ_KEY ? 'SET' : 'MISSING',
    },
    authHeader,
    validation: {
      hasAuthHeader: !!authHeader,
      startsWithBearer: authHeader?.startsWith('Bearer '),
      token: authHeader?.replace('Bearer ', ''),
    },
  });
}
