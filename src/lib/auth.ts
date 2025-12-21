// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Note: PrismaAdapter can be added once database is connected
// import { PrismaAdapter } from '@auth/prisma-adapter'
// import prisma from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Uncomment the adapter once database is connected:
  // adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // Use JWT strategy when no database adapter
  session: { strategy: "jwt" },

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  // Required for production
  secret: process.env.AUTH_SECRET,
});
