import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const publicRoutes = ["/login", "/register", "/"];
      if (publicRoutes.includes(pathname)) {
        return true;
      }

      // Route group protection
      const userRole = (auth?.user as any)?.role;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && userRole === "SUPER_ADMIN";
      }
      if (pathname.startsWith("/hse")) {
        return isLoggedIn && userRole === "HSE_ADMIN";
      }
      if (pathname.startsWith("/reward")) {
        return isLoggedIn && userRole === "REWARD_ADMIN";
      }
      if (pathname.startsWith("/worker")) {
        return isLoggedIn && userRole === "WORKER";
      }

      return isLoggedIn;
    },
  },
};

export default authConfig;
