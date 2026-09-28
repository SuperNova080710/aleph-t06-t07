"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/sign-out", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("로그아웃에 실패했습니다.");
            }

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
            {isLoading ? "로그아웃 중..." : "로그아웃"}
        </button>
    );
}