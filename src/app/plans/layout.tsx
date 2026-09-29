import { prisma } from "@/lib/prisma";
import { PlanSidebar } from "@/components/plan-sidebar";
import { cache } from "react";
import { requireUser } from "@/lib/require-user";

const getPlansForSidebar = cache(async (userId: string) => {
  return prisma.plan.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      priority: true,
      deletedAt: true,
      _count: {
        select: {
          todos: true,
        },
      },
    },
  });
});

export default async function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await requireUser({ redirectToLogin: true });

  const plans = await getPlansForSidebar(user.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <PlanSidebar
        plans={plans.map((plan) => ({
          id: plan.id,
          title: plan.title,
          priority: plan.priority,
          todoCount: plan._count.todos,
          deleted: !!plan.deletedAt,
        }))}
      />
      <section className="min-w-0">{children}</section>
    </div>
  );
}