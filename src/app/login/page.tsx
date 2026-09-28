"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        let message = "로그인에 실패했습니다.";

        try {
          const data = await response.json();

          if (typeof data?.message === "string") {
            message = data.message;
          }
        } catch {
          // JSON 응답이 아닌 경우 기본 오류 메시지를 사용합니다.
        }

        setErrorMessage(message);
        return;
      }

      router.push("/plans");
      router.refresh();
    } catch {
      setErrorMessage("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Plan → Do → See
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            로그인
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            계정에 로그인하여 내 계획을 확인하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-slate-500 dark:focus:ring-slate-800"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-slate-500 dark:focus:ring-slate-800"
              placeholder="비밀번호"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-semibold text-slate-900 underline underline-offset-4 dark:text-white"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
