import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth/options";

function createAuthHandler() {
  return NextAuth(getAuthOptions());
}

type AuthHandler = ReturnType<typeof createAuthHandler>;

export async function GET(...args: Parameters<AuthHandler>) {
  return createAuthHandler()(...args);
}

export async function POST(...args: Parameters<AuthHandler>) {
  return createAuthHandler()(...args);
}
