import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await db.select().from(schema.users).where(eq(schema.users.email, credentials.email)).limit(1);

        if (user.length === 0) {
          return null;
        }

        // Verify password
        if (!user[0].password) {
          return null; // No password set for this user
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user[0].password);

        if (!isPasswordValid) {
          return null;
        }

        // Return user data if password is correct
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};