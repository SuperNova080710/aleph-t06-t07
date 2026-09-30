import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-semibold">
          지금은 로그인이 없어 링크을 아는 사람은 누구나 볼 수 있습니다.
        </p>
        <p className="mt-1 text-sm opacity-80">
          남이 봐도 괜찮은 내용만 넣으세요. 민감한 정보나 다른 사람 정보는 적지 마세요.
        </p>
      </div> */}

      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              T06 · Plan Do See
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              계획하고, 실행하고,
              <br />
              숫자로 돌아보기
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-slate-600 dark:text-slate-300">
              내 실제 계획과 할 일, 실행 기록을 한곳에 모읍니다. 예상과 실제의 차이를 보고
              다음 계획을 개선하세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/plans" className="btn-primary">
                계획 시작하기
              </Link>
              <Link href="/review" className="btn-secondary px-4 py-2.5 text-sm">
                돌아보기
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-100 dark:text-slate-900">
              <p className="text-xs opacity-70">Flow</p>
              <p className="mt-2 text-lg font-semibold">Plan → Do → See</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 dark:bg-indigo-950/50">
                <p className="text-xs text-indigo-600 dark:text-indigo-300">Plan</p>
                <p className="mt-1 text-sm font-semibold">계획</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/50">
                <p className="text-xs text-emerald-600 dark:text-emerald-300">Do</p>
                <p className="mt-1 text-sm font-semibold">실행</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-950/50">
                <p className="text-xs text-amber-700 dark:text-amber-300">See</p>
                <p className="mt-1 text-sm font-semibold">회고</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/plans",
            title: "계획 (Plan)",
            desc: "기간, 우선순위, 성공 기준을 담은 계획을 만듭니다.",
          },
          {
            href: "/plans",
            title: "할 일 & 실행 (Do)",
            desc: "할 일을 관리하고 실제로 한 일을 기록합니다.",
          },
          {
            href: "/review",
            title: "돌아보기 (See)",
            desc: "예상과 실제를 비교하고 다음 계획을 개선합니다.",
          },
        ].map((item) => (
          <a key={item.title} href={item.href} className="card card-hover p-5">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {item.desc}
            </p>
          </a>
        ))}
      </section>

      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">데이터 내보내기</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              계획, 할 일, 실행 기록, 수정 이력, 돌아보기 자료를 한 파일로 저장합니다.
            </p>
          </div>
          <a href="/api/export" download className="btn-primary shrink-0 text-center">
            JSON으로 데이터 다운받기
          </a>
        </div>
      </section>
    </div>
  );
}