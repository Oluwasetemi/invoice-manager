import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "../auth.config";
import { getUser } from "#/app/lib/actions";
import bcrypt from "bcrypt";

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;


        const user = await getUser(email);

        if (!user) {
          return null;
        }

        // compare password

        const passwordMatch = await bcrypt.compare(password, user.password);


        if (passwordMatch) {
          return user;
        }

        return null;
      },
    }),
  ],
});

export const { auth, signIn, signOut, handlers } = nextAuth;
