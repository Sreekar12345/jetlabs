import type { Metadata } from "next";
import { Providers } from "@/providers";
import "./globals.css";

const inter = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "JetLabs | Academic Project Execution Platform",
  description:
    "JetLabs helps colleges guide students through real-world academic projects with structured milestones, faculty reviews, semester tracking, and centralized documentation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
