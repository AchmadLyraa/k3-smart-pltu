import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isAuthRoute =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Jangan ganggu API routes
  if (isApiRoute) return NextResponse.next();

  // Kalau udah login dan buka /login atau /register, redirect ke dashboard
  if (isAuthRoute) {
    if (!isLoggedIn) return NextResponse.next();
    const roleRoutes: Record<string, string> = {
      SUPER_ADMIN: "/admin/dashboard",
      HSE_ADMIN: "/hse/dashboard",
      REWARD_ADMIN: "/reward/dashboard",
      WORKER: "/worker/home",
    };
    return NextResponse.redirect(new URL(roleRoutes[role] ?? "/", nextUrl));
  }

  // Kalau belum login dan bukan public route, redirect ke login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|fonts|manifest|favicon.ico).*)",
  ],
};
