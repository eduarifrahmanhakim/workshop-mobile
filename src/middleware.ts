import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;
  
  // Skip public files
  const PUBLIC_FILE = /\.(.*)$/;
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const isLoginPage = pathname.startsWith("/login");
  const isRootPath = pathname === "/";
  
  // Public routes yang boleh diakses tanpa login
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // CASE 1: Sudah login tapi akses login/root → redirect ke services
  if (token && (isLoginPage || isRootPath)) {
    // const redirectUrl = new URL("/services", req.url);
    // const response = NextResponse.redirect(redirectUrl);
    // // Prevent caching
    // response.headers.set('Cache-Control', 'no-store, must-revalidate');
    // return response;
  }

  // CASE 2: Belum login tapi akses protected route → redirect ke login
  if (!token && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(redirectUrl);
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }

  // CASE 3: Other cases → proceed with cache control
  const response = NextResponse.next();
  if (!isPublicRoute) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};