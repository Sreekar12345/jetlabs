"use client";

import { motion } from "framer-motion";
import { Orbit } from "lucide-react";
import {
  AUTH_HERO_CONTENT,
  AUTH_HERO_STATS,
  SYNTRA_BRAND_NAME,
} from "@/lib/auth/presentation";
import { StatsCard } from "@/components/auth/stats-card";

export function AuthHero() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden border-r border-black/10 bg-block-navy text-white lg:flex">
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 flex w-full flex-col justify-between px-12 py-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <div className="flex size-12 items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-white shadow-none backdrop-blur">
            <Orbit className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">
              {SYNTRA_BRAND_NAME}
            </p>
            <p className="text-sm text-slate-300/70">{AUTH_HERO_CONTENT.badge}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="max-w-3xl space-y-8"
        >
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white shadow-none backdrop-blur">
              {AUTH_HERO_CONTENT.badge}
            </p>
            <h2 className="max-w-3xl whitespace-pre-line text-5xl font-semibold leading-tight tracking-normal text-balance text-white xl:text-6xl">
              {AUTH_HERO_CONTENT.title}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-300/[0.74]">
              {AUTH_HERO_CONTENT.description}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {AUTH_HERO_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + index * 0.05, ease: "easeOut" }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="max-w-xl text-sm leading-7 text-slate-300/60"
        >
          {AUTH_HERO_CONTENT.footer}
        </motion.p>
      </div>
    </aside>
  );
}
