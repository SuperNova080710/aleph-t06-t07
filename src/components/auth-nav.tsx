import Link from "next/link";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LogoutButton } from "@/components/logout-button";

export async function AuthNav() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return (
            <div className="flex items-center gap-1">
                <Link
                    href="/login"
                    className="rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                    로그인
                </Link>
                <Link
                    href="/signup"
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                    회원가입
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">
                {session.user.email}
            </span>
            <LogoutButton />
        </div>
    );
}