import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { getAuthSecret, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/config";
import { loginSchema } from "@/validations/auth";

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Syntra Credentials",
      credentials: {
        role: { label: "Role", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          console.log("Parsed validation failed:", parsed.error);
          return null;
        }

        console.log("Parsed validation success, searching user by email:", parsed.data.email);
        const user = await db.user.findUnique({
          where: {
            email: parsed.data.email,
          },
        });

        if (!user) {
          console.log("User not found in DB");
          return null;
        }

        console.log("User found in DB, verifying password. DB role:", user.role, "Parsed role:", parsed.data.role);
        const passwordValid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordValid) {
          console.log("Password verification failed");
          return null;
        }

        console.log("Password valid. Comparing roles...");
        if (user.role !== parsed.data.role) {
          console.log("Role comparison failed: DB role", user.role, "!= Parsed role", parsed.data.role);
          const roleLabel = parsed.data.role === "ADMIN" ? "admin" : parsed.data.role.toLowerCase();
          throw new Error(`This account is not registered as ${roleLabel}`);
        }

        console.log("Authorize successful for user:", user.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as typeof session.user.role) ?? "STUDENT";
        session.user.avatar = (token.avatar as string | null | undefined) ?? null;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
  },
};
