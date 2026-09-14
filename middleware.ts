import { NextResponse, type NextRequest } from 'next/server';
import { assertPreviewIntegration, isPreviewEnvironment } from '@/lib/preview-safety';

export function middleware(request: NextRequest) {
  if (!isPreviewEnvironment()) return NextResponse.next();
  try { assertPreviewIntegration(); }
  catch {
    return NextResponse.json({ code: 'PREVIEW_NOT_CONFIGURED', message: 'Preview visual. Login e pagamentos aguardam o ambiente de teste. / Visual preview. Sign-in and payments require test environment configuration.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/api/:path*', '/admin/:path*', '/checkout/:path*', '/en/checkout/:path*', '/conta/:path*', '/en/account/:path*', '/login/:path*', '/my-programs/:path*', '/go/:path*'] };
