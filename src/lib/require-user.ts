import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

type RequireUserOptions = {
    redirectToLogin?: boolean;
};

export async function requireUser(options: RequireUserOptions = {}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        if (options.redirectToLogin) {
            redirect("/login");
        }

        throw new Error("Unauthorized");
    }

    return session.user;
}