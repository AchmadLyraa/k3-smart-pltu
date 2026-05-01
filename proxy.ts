import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  if (nextUrl.pathname === "/login" && req.auth) {
    return Response.redirect(new URL("/", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
