"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Orbit } from "lucide-react";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { SignupForm } from "@/components/auth/SignupForm";
import type { LoginRole } from "@/types/auth";

type SignupPageProps = {
  callbackUrl?: string | null;
};

export function SignupPage({ callbackUrl }: SignupPageProps) {
  const [activeRole, setActiveRole] = useState<LoginRole>("STUDENT");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-[700px]"
        style={{
          "--primary": "#4F46E5",
          "--primary-foreground": "#ffffff",
          "--ring": "#4F46E5",
        } as React.CSSProperties}
      >
        <div className="w-full bg-white border border-slate-200/70 rounded-[20px] shadow-xl shadow-slate-100/50 p-8 sm:p-12">
          {/* Header Block */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 mb-4">
              <Orbit className="size-6 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Create Your Account
            </h1>
            <p className="mt-2 text-base text-[#64748B]">
              Join your institution workspace
            </p>
          </div>

          {/* Role Selector */}
          <div className="max-w-xs mx-auto mb-8">
            <RoleSelector value={activeRole} onChange={setActiveRole} />
          </div>

          {/* Registration Form */}
          <SignupForm activeRole={activeRole} callbackUrl={callbackUrl} />

          {/* Footer Navigation */}
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-[#64748B]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
