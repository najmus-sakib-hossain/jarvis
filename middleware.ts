import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // Check if the pathname is for a static asset/public file
  if (
    [
      '/manifest.json',
      '/favicon.ico',
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/opengraph-image.png',
      '/Doraemon.jpg',
    ].includes(pathname) || 
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|mp3|mp4|webm|ogg|pdf|css|js)$/)
  )
    return

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

