import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthNav } from "@/components/auth-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "플랜두씨 다이어리",
  description: "Plan → Do → See 다이어리",
};

const nav = [
  { href: "/", label: "홈" },
  { href: "/plans", label: "계획" },
  { href: "/review", label: "돌아보기" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="min-h-screen">
            <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
                <a href="/" className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
                    P
                  </span>
                  <div>
                    <p className="text-sm font-bold tracking-tight">플랜두씨 다이어리</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Plan → Do → See
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-2">
                  <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
                    {nav.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                  <AuthNav />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>

            <footer className="border-t border-slate-200/70 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              로그인 없이 동작하는 공개 다이어리 · 민감 정보는 넣지 마세요
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}