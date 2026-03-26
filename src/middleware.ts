import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes — check auth
  if (pathname.startsWith('/admin')) {
    // Allow /admin/login without auth
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin_token')?.value
      if (token && token === process.env.ADMIN_SECRET_TOKEN) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.next()
    }

    // All other /admin/* routes require auth
    const token = request.cookies.get('admin_token')?.value
    if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // All other routes — i18n middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}
