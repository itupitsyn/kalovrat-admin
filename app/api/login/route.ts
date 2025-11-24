import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (
      !body.login ||
      !body.password ||
      body.login !== process.env['ADMIN_LOGIN'] ||
      body.password !== process.env['ADMIN_PASSWORD']
    ) {
      return new NextResponse('', { status: 401 });
    }

    const hash = crypto.createHash('sha512').update(`${body.login}:${body.password}`).digest('hex');

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const cookieStore = await cookies();
    cookieStore.set('session', hash, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
  } catch {
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
