import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedin = !!auth?.user;

      // check if user has a role permission to access /admin-dashboard or /user-dashboard

      const isDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboard) {
        if (isLoggedin) return true;
        return false;
      } else if (isLoggedin) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  debug: true,
};
