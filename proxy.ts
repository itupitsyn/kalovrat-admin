import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { isAuthenticated } from './lib/utils';

export default async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!isAuthenticated(session?.value)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/login).*)'],
};
