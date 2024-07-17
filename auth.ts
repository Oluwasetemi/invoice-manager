import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        //
        //
        //
      },
    }),
  ],
});

export const { auth, signIn, signOut } = nextAuth;
