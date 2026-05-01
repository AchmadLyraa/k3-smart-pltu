import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations";
import type { NextAuthConfig } from "next-auth";

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Auth Config (FULL - pakai Prisma)
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const validatedCreds = signInSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validatedCreds.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: validatedCreds.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            status: true,
          },
        });

        if (!user) return null;
        if (user.status !== "ACTIVE") return null;

        const isValidPassword = user.password
          ? await bcrypt.compare(validatedCreds.data.password, user.password)
          : false;

        if (!isValidPassword) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Export handlers (API only, bukan middleware)
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
