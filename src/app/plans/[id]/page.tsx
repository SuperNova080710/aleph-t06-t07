import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    updatePlan,
    createTodo,
    updateTodoStatus,
    deleteTodo,
    createExecutionLog,
    deletePlan,
    restorePlan,
} from "../actions";
import { PlanDetailShell } from "@/components/plan-detail-shell";
import { requireUser } from "@/lib/require-user";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        q?: string;
        status?: string;
        sort?: string;
    }>;
};

export default async function PlanDetailPage({ params, searchParams }: Props) {
    const { id } = await params;
    const sp = await searchParams;

    const q = (sp.q || "").trim();
    const statusFilter = sp.status || "ALL";
    const sort = sp.sort || "priority";

    const user = await requireUser({ redirectToLogin: true });

    const plan = await prisma.plan.findFirst({
        where: {
            id,
            userId: user.id,
        },
        include: {
            versions: true,
            todos: {
                include: {
                    executionLogs: true,
                },
            },
            _count: {
                select: {
                    todos: true,
                },
            },
        },
    });

    if (!plan) notFound();

    let todos = plan.todos.filter((todo) => {
        if (!q) return true;
        const target = `${todo.title} ${todo.description || ""} ${todo.tags.join(" ")}`.toLowerCase();
        return target.includes(q.toLowerCase());
    });

    if (statusFilter !== "ALL") {
        todos = todos.filter((todo) => todo.status === statusFilter);
    }

    todos = [...todos].sort((a, b) => {
        if (sort === "dueDate") {
            const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
            if (ad !== bd) return ad - bd;
            return a.priority - b.priority;
        }
        if (sort === "createdAt") {
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toISOString().slice(0, 10);
    };

    const formatDateTimeLocal = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60 * 1000);
        return local.toISOString().slice(0, 16);
    };

    const statusLabel: Record<string, string> = {
        PENDING: "대기",
        IN_PROGRESS: "진행 중",
        COMPLETED: "완료",
        CANCELLED: "취소",
    };

    const statusClass: Record<string, string> = {
        PENDING:
            "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        IN_PROGRESS:
            "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200",
        COMPLETED:
            "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
        CANCELLED:
            "rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    };

    const nowLocal = formatDateTimeLocal(new Date());

    return (
        <PlanDetailShell planId={plan.id} title={plan.title}>
            <div>
                <a
                    href="/plans"
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    ← 계획 목록
                </a>

                {plan.description && (
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{plan.description}</p>
                )}

                {plan.deletedAt && (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                        이 계획은 삭제된 상태입니다. 복원하면 다시 목록에 표시됩니다.
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                    {plan.deletedAt ? (
                        <form action={restorePlan}>
                            <input type="hidden" name="id" value={plan.id} />
                            <button type="submit" className="btn-primary">
                                계획 복원
                            </button>
                        </form>
                    ) : (
                        <form action={deletePlan}>
                            <input type="hidden" name="id" value={plan.id} />
                            <button
                                type="submit"
                                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"
                            >
                                계획 삭제
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <section className="card p-6">
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">현재 계획</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">우선순위</dt>
                        <dd className="font-medium">{plan.priority}</dd>
                    </div>
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">예상 시간</dt>
                        <dd className="font-medium">
                            {plan.estimatedMinutes ? `${plan.estimatedMinutes}분` : "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">기간</dt>
                        <dd className="font-medium">
                            {formatDate(plan.startDate) || "-"} ~ {formatDate(plan.endDate) || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">할 일 수</dt>
                        <dd className="font-medium">{plan._count.todos}개</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-slate-500 dark:text-slate-400">성공 기준</dt>
                        <dd className="font-medium">{plan.successCriteria || "-"}</dd>
                    </div>
                </dl>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h3 className="font-semibold">할 일 (Todo)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        정렬 기준:{" "}
                        {sort === "dueDate"
                            ? "마감일 → 우선순위"
                            : sort === "createdAt"
                                ? "최신 생성순"
                                : "우선순위 → 최신 생성순"}
                    </p>
                </div>

                <form className="card grid gap-3 p-4 sm:grid-cols-4">
                    <input name="q" defaultValue={q} placeholder="제목, 설명, 태그 검색" className="input sm:col-span-2" />
                    <select name="status" defaultValue={statusFilter} className="input">
                        <option value="ALL">전체 상태</option>
                        <option value="PENDING">대기</option>
                        <option value="IN_PROGRESS">진행 중</option>
                        <option value="COMPLETED">완료</option>
                        <option value="CANCELLED">취소</option>
                    </select>
                    <select name="sort" defaultValue={sort} className="input">
                        <option value="priority">우선순위순</option>
                        <option value="dueDate">마감일순</option>
                        <option value="createdAt">최신순</option>
                    </select>
                    <button type="submit" className="btn-primary sm:col-span-4 sm:w-fit">
                        적용
                    </button>
                </form>

                <div className="card p-6">
                    <h4 className="mb-4 text-sm font-semibold">할 일 추가</h4>
                    <form action={createTodo} className="space-y-3">
                        <input type="hidden" name="planId" value={plan.id} />
                        <div>
                            <label className="mb-1 block text-sm font-medium">제목 *</label>
                            <input name="title" required placeholder="예: Prisma 스키마 작성" className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">설명</label>
                            <input name="description" placeholder="간단한 설명" className="input" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">우선순위</label>
                                <select name="priority" defaultValue="3" className="input">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">마감일</label>
                                <input type="date" name="dueDate" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">예상 시간(분)</label>
                                <input type="number" name="estimatedMinutes" min="0" placeholder="30" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">태그 (쉼표 구분)</label>
                                <input name="tags" placeholder="backend, urgent" className="input" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary">
                            할 일 추가
                        </button>
                    </form>
                </div>

                {todos.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        조건에 맞는 할 일이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {todos.map((todo) => (
                            <li key={todo.id} className="card p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium">{todo.title}</span>
                                            <span className={statusClass[todo.status] ?? statusClass.PENDING}>
                                                {statusLabel[todo.status] ?? todo.status}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                우선순위 {todo.priority}
                                            </span>
                                        </div>
                                        {todo.description && (
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                {todo.description}
                                            </p>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            {todo.dueDate && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    마감 {formatDate(todo.dueDate)}
                                                </span>
                                            )}
                                            {todo.estimatedMinutes && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    예상 {todo.estimatedMinutes}분
                                                </span>
                                            )}
                                            {todo.tags?.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {todo.status !== "IN_PROGRESS" && (
                                            <form action={updateTodoStatus}>
                                                <input type="hidden" name="id" value={todo.id} />
                                                <input type="hidden" name="planId" value={plan.id} />
                                                <input type="hidden" name="status" value="IN_PROGRESS" />
                                                <button type="submit" className="btn-secondary">
                                                    진행
                                                </button>
                                            </form>
                                        )}
                                        {todo.status !== "COMPLETED" && (
                                            <form action={updateTodoStatus}>
                                                <input type="hidden" name="id" value={todo.id} />
                                                <input type="hidden" name="planId" value={plan.id} />
                                                <input type="hidden" name="status" value="COMPLETED" />
                                                <button type="submit" className="btn-secondary">
                                                    완료
                                                </button>
                                            </form>
                                        )}
                                        {todo.status === "COMPLETED" && (
                                            <form action={updateTodoStatus}>
                                                <input type="hidden" name="id" value={todo.id} />
                                                <input type="hidden" name="planId" value={plan.id} />
                                                <input type="hidden" name="status" value="PENDING" />
                                                <button type="submit" className="btn-secondary">
                                                    되돌리기
                                                </button>
                                            </form>
                                        )}
                                        <form action={deleteTodo}>
                                            <input type="hidden" name="id" value={todo.id} />
                                            <input type="hidden" name="planId" value={plan.id} />
                                            <button
                                                type="submit"
                                                className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"
                                            >
                                                삭제
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                    <summary className="cursor-pointer text-sm font-medium">
                                        실행 기록 남기기 / 보기 ({todo.executionLogs.length})
                                    </summary>

                                    <form action={createExecutionLog} className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <input type="hidden" name="todoId" value={todo.id} />
                                        <input type="hidden" name="planId" value={plan.id} />
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">시작 시각 *</label>
                                            <input
                                                type="datetime-local"
                                                name="startedAt"
                                                required
                                                defaultValue={nowLocal}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">종료 시각</label>
                                            <input type="datetime-local" name="endedAt" className="input" />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">실제 소요(분)</label>
                                            <input type="number" name="actualMinutes" min="0" placeholder="45" className="input" />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">막힌 이유</label>
                                            <input name="blockedReason" placeholder="예: 환경변수 설정 오류" className="input" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-xs font-medium">메모</label>
                                            <input name="note" placeholder="선택 메모" className="input" />
                                        </div>
                                        <button type="submit" className="btn-primary sm:col-span-2 sm:w-fit">
                                            실행 기록 저장
                                        </button>
                                    </form>

                                    {todo.executionLogs.length > 0 && (
                                        <ul className="mt-3 space-y-2">
                                            {todo.executionLogs.map((log) => (
                                                <li
                                                    key={log.id}
                                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                >
                                                    <div>
                                                        {log.startedAt.toLocaleString("ko-KR")}
                                                        {log.endedAt && ` ~ ${log.endedAt.toLocaleString("ko-KR")}`}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {log.actualMinutes != null && <span>실제 {log.actualMinutes}분</span>}
                                                        {log.blockedReason && (
                                                            <span className="text-amber-700 dark:text-amber-300">
                                                                막힘: {log.blockedReason}
                                                            </span>
                                                        )}
                                                        {log.note && <span>메모: {log.note}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="card p-6">
                <h3 className="mb-4 font-semibold">계획 수정</h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    수정하면 현재 내용이 이력으로 자동 저장됩니다.
                </p>
                <form action={updatePlan} className="space-y-4">
                    <input type="hidden" name="id" value={plan.id} />
                    <div>
                        <label className="mb-1 block text-sm font-medium">제목 *</label>
                        <input name="title" required defaultValue={plan.title} className="input" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">설명</label>
                        <textarea name="description" rows={2} defaultValue={plan.description ?? ""} className="input" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">시작일</label>
                            <input type="date" name="startDate" defaultValue={formatDate(plan.startDate)} className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">종료일</label>
                            <input type="date" name="endDate" defaultValue={formatDate(plan.endDate)} className="input" />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">우선순위</label>
                            <select name="priority" defaultValue={String(plan.priority)} className="input">
                                <option value="1">1 - 매우 높음</option>
                                <option value="2">2 - 높음</option>
                                <option value="3">3 - 보통</option>
                                <option value="4">4 - 낮음</option>
                                <option value="5">5 - 매우 낮음</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">예상 시간 (분)</label>
                            <input
                                type="number"
                                name="estimatedMinutes"
                                min="0"
                                defaultValue={plan.estimatedMinutes ?? ""}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">성공 기준</label>
                            <input name="successCriteria" defaultValue={plan.successCriteria ?? ""} className="input" />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">수정 메모 (선택)</label>
                        <input name="changeNote" placeholder="예: 마감일을 이틀 늦춤" className="input" />
                    </div>
                    <button type="submit" className="btn-primary">
                        수정 저장 (이력 남기기)
                    </button>
                </form>
            </section>

            <section className="space-y-4">
                <h3 className="font-semibold">수정 이력</h3>
                {plan.versions.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        아직 수정 이력이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {plan.versions.map((version) => (
                            <li
                                key={version.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium">{version.title}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {version.changedAt.toLocaleString("ko-KR")}
                                    </span>
                                </div>
                                {version.changeNote && (
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">메모: {version.changeNote}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PlanDetailShell>
    );
}