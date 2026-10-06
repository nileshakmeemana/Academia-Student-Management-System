import { NextResponse } from 'next/server';

// Route guard — the equivalent of the session checks at the top of every servlet.
// The token is only *decoded* here to route by role; Express verifies it on every API call.
const HOME = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };

function readToken(req) {
  const token = req.cookies.get('sms_token')?.value;
  if (!token) return null;
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = readToken(req);

  // LoginServlet.doGet: signed-in users skip the login/register pages.
  if (pathname === '/login' || pathname === '/register') {
    if (session && HOME[session.role]) return NextResponse.redirect(new URL(HOME[session.role], req.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  const area = pathname.split('/')[1];
  if (['admin', 'teacher', 'student'].includes(area) && area !== session.role) {
    return NextResponse.redirect(new URL(HOME[session.role] || '/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/profile', '/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
