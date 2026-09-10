import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY_LABELS = ["D", "S", "C", "P", "J", "J", "SH"];

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function last7Days() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function formatSum(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
}

export default async function AnalitikaPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const days = last7Days();
  const since = days[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    openTasks,
    doneTasksWeek,
    activeHabits,
    habitLogsWeek,
    prayerLogsWeek,
    learningItems,
    transactionsMonth,
    careerCount,
    mediaItems,
  ] = await Promise.all([
    prisma.task.count({ where: { userId, status: { not: "DONE" } } }),
    prisma.task.findMany({
      where: { userId, status: "DONE", updatedAt: { gte: since } },
      select: { updatedAt: true },
    }),
    prisma.habit.count({ where: { userId, archived: false } }),
    prisma.habitLog.findMany({
      where: { userId, completed: true, date: { gte: since } },
      select: { date: true },
    }),
    prisma.prayerLog.findMany({
      where: { userId, completed: true, date: { gte: since } },
      select: { date: true },
    }),
    prisma.learningItem.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart } },
      select: { amount: true, type: true },
    }),
    prisma.careerItem.count({ where: { userId } }),
    prisma.mediaLog.findMany({ where: { userId }, select: { rating: true } }),
  ]);

  const tasksByDay = new Map<string, number>();
  for (const t of doneTasksWeek) {
    const key = toDateKey(t.updatedAt);
    tasksByDay.set(key, (tasksByDay.get(key) ?? 0) + 1);
  }

  const habitsByDay = new Map<string, number>();
  for (const l of habitLogsWeek) {
    const key = toDateKey(l.date);
    habitsByDay.set(key, (habitsByDay.get(key) ?? 0) + 1);
  }

  const prayersByDay = new Map<string, number>();
  for (const l of prayerLogsWeek) {
    const key = toDateKey(l.date);
    prayersByDay.set(key, (prayersByDay.get(key) ?? 0) + 1);
  }

  const dailyActivity = days.map((d) => {
    const key = toDateKey(d);
    return {
      key,
      label: DAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
      total:
        (tasksByDay.get(key) ?? 0) +
        (habitsByDay.get(key) ?? 0) +
        (prayersByDay.get(key) ?? 0),
    };
  });
  const maxActivity = Math.max(1, ...dailyActivity.map((d) => d.total));

  const prayerRate =
    prayerLogsWeek.length > 0
      ? Math.round((prayerLogsWeek.length / (5 * 7)) * 100)
      : 0;

  const habitRate =
    activeHabits > 0
      ? Math.round((habitLogsWeek.length / (activeHabits * 7)) * 100)
      : 0;

  const learningCounts: Record<string, number> = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    DROPPED: 0,
  };
  for (const g of learningItems) {
    learningCounts[g.status] = g._count;
  }

  const income = transactionsMonth
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactionsMonth
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const maxFinance = Math.max(1, income, expense);

  const ratedMedia = mediaItems.filter((m) => m.rating);
  const avgRating =
    ratedMedia.length > 0
      ? (
          ratedMedia.reduce((sum, m) => sum + (m.rating ?? 0), 0) /
          ratedMedia.length
        ).toFixed(1)
      : "—";

  const statTiles = [
    { label: "Ochiq vazifalar", value: openTasks },
    { label: "Faol odatlar", value: activeHabits },
    { label: "Ibodat (7 kun)", value: `${prayerRate}%` },
    { label: "Odat (7 kun)", value: `${habitRate}%` },
    { label: "Karyera yozuvlari", value: careerCount },
    { label: "Media o'rtacha reyting", value: avgRating },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-50">Analitika</h1>
      <p className="mb-8 text-sm text-slate-400">
        Barcha modullardan umumiy holat va so&apos;nggi 7 kunlik faollik.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statTiles.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <p className="text-2xl font-semibold text-slate-50">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-300">
          Kunlik faollik (vazifa + odat + ibodat, so&apos;nggi 7 kun)
        </h2>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {dailyActivity.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end justify-center">
                <div
                  className="w-6 rounded-t-md bg-indigo-600"
                  style={{
                    height: `${Math.max(4, (d.total / maxActivity) * 100)}%`,
                  }}
                  title={`${d.total} ta faoliyat`}
                />
              </div>
              <span className="text-xs text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">
            Bu oy moliya (kirim / chiqim)
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Kirim
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Chiqim
            </span>
          </div>
        </div>
        <div className="flex items-end justify-center gap-6" style={{ height: 120 }}>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-full items-end">
              <div
                className="w-12 rounded-t-md bg-emerald-600"
                style={{ height: `${Math.max(4, (income / maxFinance) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{formatSum(income)}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-full items-end">
              <div
                className="w-12 rounded-t-md bg-red-600"
                style={{ height: `${Math.max(4, (expense / maxFinance) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{formatSum(expense)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-4 text-sm font-medium text-slate-300">
          O&apos;qish holati
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { key: "PLANNED", label: "Rejalashtirilgan" },
            { key: "IN_PROGRESS", label: "Jarayonda" },
            { key: "DONE", label: "Tugallangan" },
            { key: "DROPPED", label: "Tashlab qo'yilgan" },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-32 text-xs text-slate-400">{s.label}</span>
              <span className="text-sm font-medium text-slate-100">
                {learningCounts[s.key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
