import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AvatarViewer } from "@/components/avatar-viewer";

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

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Past",
  MEDIUM: "O'rta",
  HIGH: "Yuqori",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const days = last7Days();
  const since = days[0];
  const todayKey = toDateKey(new Date());
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    user,
    openTasksCount,
    doneTasksTotal,
    allTasksTotal,
    focusTask,
    doneTasksWeek,
    activeHabits,
    habitLogsWeek,
    prayerLogsWeek,
    transactionsMonth,
    recentTasks,
    recentTransactions,
    assets,
    liabilities,
    projectsCount,
    skills,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, gender: true, avatarUrl: true, title: true },
    }),
    prisma.task.count({ where: { userId, status: { not: "DONE" } } }),
    prisma.task.count({ where: { userId, status: "DONE" } }),
    prisma.task.count({ where: { userId } }),
    prisma.task.findFirst({
      where: { userId, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    }),
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
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart } },
      select: { amount: true, type: true },
    }),
    prisma.task.findMany({
      where: { userId, status: "DONE" },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { title: true, updatedAt: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 3,
      select: { category: true, type: true, date: true },
    }),
    prisma.asset.findMany({ where: { userId }, select: { value: true } }),
    prisma.liability.findMany({ where: { userId }, select: { amount: true } }),
    prisma.project.count({ where: { userId } }),
    prisma.skill.findMany({
      where: { userId },
      orderBy: { proficiency: "desc" },
      take: 3,
      select: { name: true },
    }),
  ]);

  const tasksByDay = new Map<string, number>();
  for (const t of doneTasksWeek) tasksByDay.set(toDateKey(t.updatedAt), (tasksByDay.get(toDateKey(t.updatedAt)) ?? 0) + 1);
  const habitsByDay = new Map<string, number>();
  for (const l of habitLogsWeek) habitsByDay.set(toDateKey(l.date), (habitsByDay.get(toDateKey(l.date)) ?? 0) + 1);
  const prayersByDay = new Map<string, number>();
  for (const l of prayerLogsWeek) prayersByDay.set(toDateKey(l.date), (prayersByDay.get(toDateKey(l.date)) ?? 0) + 1);

  const todayTotal =
    (tasksByDay.get(todayKey) ?? 0) + (habitsByDay.get(todayKey) ?? 0) + (prayersByDay.get(todayKey) ?? 0);

  let combinedStreak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (;;) {
    const key = toDateKey(cursor);
    const total = (tasksByDay.get(key) ?? 0) + (habitsByDay.get(key) ?? 0) + (prayersByDay.get(key) ?? 0);
    if (total <= 0) break;
    combinedStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const taskProgress = allTasksTotal > 0 ? Math.round((doneTasksTotal / allTasksTotal) * 100) : 0;
  const todayPrayerCount = prayersByDay.get(todayKey) ?? 0;

  const income = transactionsMonth.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactionsMonth.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const now = new Date();
  const dayProgress = Math.min(100, Math.max(0, ((now.getHours() * 60 + now.getMinutes() - 6 * 60) / (16 * 60)) * 100));

  const activity = [
    ...recentTasks.map((t) => ({ label: `"${t.title}" bajarildi`, time: t.updatedAt, color: "#34d399" })),
    ...recentTransactions.map((t) => ({
      label: `${t.type === "INCOME" ? "Kirim" : "Chiqim"}: ${t.category}`,
      time: t.date,
      color: t.type === "INCOME" ? "#34d399" : "#f87171",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 4);

  const isFemale = user?.gender === "FEMALE";

  const totalAssets = assets.reduce((s, a) => s + Number(a.value), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.amount), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.85fr_1fr]">
      {/* left column */}
      <div className="flex flex-col gap-5">
        {/* live avatar hero */}
        <div
          className="relative min-h-[420px] flex-1 overflow-hidden rounded-3xl border border-[#232327]"
          style={{ background: "radial-gradient(120% 140% at 50% 10%, #1c1c20 0%, #101013 55%, #0b0b0d 100%)" }}
        >
          <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur">
            <div className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
            <span className="text-xs font-semibold tracking-wide">LIVE 3D AVATAR</span>
          </div>
          <div className="absolute right-5 top-5 z-10 rounded-full bg-black/40 px-3.5 py-1.5 text-xs text-[#9a9aa2] backdrop-blur">
            360° · <span className="font-semibold text-[#f5f4f2]">{user?.name ?? "Siz"}</span>
          </div>

          {user?.avatarUrl ? (
            <div className="absolute inset-0">
              <AvatarViewer url={user.avatarUrl} />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[380px] w-[220px]">
                  <div className="absolute left-1/2 top-[36%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff8a3d] opacity-15 blur-[60px]" />
                  <svg width="220" height="380" viewBox="0 0 260 460" className="relative z-10">
                    <defs>
                      <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3a3a42" />
                        <stop offset="100%" stopColor="#18181c" />
                      </linearGradient>
                    </defs>
                    {isFemale && <path d="M78 118 C78 84 100 62 130 62 C160 62 182 84 182 118 C182 96 168 84 130 84 C92 84 78 96 78 118 Z" fill="url(#bodyFill)" />}
                    <ellipse cx="130" cy="150" rx="46" ry="52" fill="url(#bodyFill)" />
                    <path
                      d="M62 300 C62 220 90 196 130 196 C170 196 198 220 198 300 L206 440 L172 440 L160 320 L150 440 L110 440 L100 320 L88 440 L54 440 Z"
                      fill="url(#bodyFill)"
                    />
                    <ellipse cx="130" cy="452" rx="70" ry="8" fill="#ff8a3d" opacity="0.18" />
                  </svg>
                  <div className="absolute -bottom-1.5 left-1/2 h-0.5 w-[190px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ff8a3d] to-transparent opacity-70" />
                </div>
              </div>

              <button className="absolute left-6 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#2b2b30] bg-white/[0.06]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8e7e4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 5 L8 12 L15 19" />
                </svg>
              </button>
              <button className="absolute right-6 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#2b2b30] bg-white/[0.06]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8e7e4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5 L16 12 L9 19" />
                </svg>
              </button>

              <Link
                href="/avatar"
                className="absolute bottom-[86px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#ff8a3d] px-5 py-2.5 text-xs font-semibold text-[#0a0a0d]"
              >
                3D avatar yaratish
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5 L16 12 L9 19" />
                </svg>
              </Link>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent px-6 py-5">
            <div>
              <div className="text-xs text-[#9a9aa2]">Bugungi holat</div>
              <div className="text-[15px] font-semibold">Bugun {todayTotal} ta amal bajarildi</div>
            </div>
          </div>
        </div>

        {/* module cards */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <div className="flex flex-col rounded-[20px] border border-[#232327] bg-[#131316] p-5">
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#ff8a3d2a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff8a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11 L11 13 L15.5 8" />
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Vazifalar</div>
                <div className="text-xs text-[#6b6b73]">{openTasksCount} ta ochiq</div>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#232327" strokeWidth="9" />
                <circle
                  cx="48" cy="48" r="40" fill="none" stroke="#ff8a3d" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * taskProgress) / 100}
                  transform="rotate(-90 48 48)"
                />
                <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="700" fill="#f5f4f2">{taskProgress}%</text>
              </svg>
            </div>
          </div>

          <div className="flex flex-col rounded-[20px] border border-[#232327] bg-[#131316] p-5">
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#ff8a3d2a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff8a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 2 L21 6 L17 10" />
                  <path d="M3 12 V10 A4 4 0 0 1 7 6 H21" />
                  <path d="M7 22 L3 18 L7 14" />
                  <path d="M21 12 V14 A4 4 0 0 1 17 18 H3" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Odatlar</div>
                <div className="text-xs text-[#6b6b73]">{activeHabits} ta faol</div>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              {days.map((d) => {
                const key = toDateKey(d);
                const has = (habitsByDay.get(key) ?? 0) > 0;
                return (
                  <div
                    key={key}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${
                      has ? "bg-[#ff8a3d] text-[#0a0a0d]" : "bg-[#232327] text-[#6b6b73]"
                    }`}
                  >
                    {DAY_LABELS[d.getDay()]}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-center text-[11px] text-[#9a9aa2]">{combinedStreak} kunlik faollik streak</div>
          </div>

          <div className="flex flex-col rounded-[20px] border border-[#232327] bg-[#131316] p-5">
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#ff8a3d2a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff8a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 15.5 A8.5 8.5 0 1 1 10 4.2 A6.8 6.8 0 0 0 20 15.5 Z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Ibodat</div>
                <div className="text-xs text-[#6b6b73]">Bugun {todayPrayerCount}/5</div>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#232327" strokeWidth="9" />
                <circle
                  cx="48" cy="48" r="40" fill="none" stroke="#34d399" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * todayPrayerCount) / 5}
                  transform="rotate(-90 48 48)"
                />
                <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="700" fill="#f5f4f2">{todayPrayerCount}/5</text>
              </svg>
            </div>
          </div>

          <Link
            href="/boylik"
            className="flex flex-col rounded-[20px] border border-[#ff8a3d55] bg-[#1a140c] p-5"
          >
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#ff8a3d2a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff8a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5 V16.5" />
                  <path d="M14.8 9.6 C14.8 8.3 13.6 7.5 12 7.5 C10.2 7.5 9 8.4 9 9.7 C9 12.3 14.8 11 14.8 13.7 C14.8 15 13.6 15.9 12 15.9 C10.4 15.9 9.2 15.1 9.2 13.8" />
                </svg>
              </div>
              <div className="text-sm font-semibold">Boylik</div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="text-xl font-extrabold">
                {new Intl.NumberFormat("uz-UZ", { notation: "compact" }).format(netWorth)}
              </div>
              <div className="mt-1 text-[11px] text-[#9a9aa2]">sof boylik, so&apos;m</div>
            </div>
          </Link>
        </div>
      </div>

      {/* right column */}
      <div className="flex flex-col gap-5">
        <Link
          href="/portfolio"
          className="rounded-[20px] border border-[#ff8a3d55] bg-[#1a140c] p-[18px]"
        >
          <div className="mb-3.5 flex items-center gap-3">
            <div className="h-[46px] w-[46px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#ff8a3d] to-[#7a3d10]" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Portfolio</div>
              <div className="truncate text-[11px] text-[#9a9aa2]">{user?.title || "Lavozimingizni qo'shing"}</div>
            </div>
          </div>
          <div className="mb-3.5 flex flex-wrap gap-1.5">
            {skills.length > 0 ? (
              skills.map((s) => (
                <span key={s.name} className="rounded-full bg-[#232327] px-2.5 py-1 text-[10px] text-[#c9c9ce]">{s.name}</span>
              ))
            ) : (
              <span className="text-[11px] text-[#6b6b73]">Ko&apos;nikma qo&apos;shilmagan</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#9a9aa2]">{projectsCount} ta loyiha ko&apos;rsatilgan</span>
            <span className="font-semibold text-[#ff8a3d]">Ko&apos;rish →</span>
          </div>
        </Link>

        <div className="rounded-[20px] border border-[#232327] bg-[#131316] p-5">
          <div className="mb-4 flex items-center gap-3.5">
            <div className="h-[52px] w-[52px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#ff8a3d] to-[#7a3d10]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold">Bugungi fokus</div>
              <div className="truncate text-xs text-[#6b6b73]">Eng ustuvor vazifa</div>
            </div>
          </div>

          {focusTask ? (
            <div className="mb-4 rounded-xl border border-[#232327] bg-[#1a1a1e] px-4 py-3">
              <div className="text-sm font-medium">{focusTask.title}</div>
              <div className="mt-1 text-xs text-[#ff8a3d]">{PRIORITY_LABEL[focusTask.priority]} ustuvorlik</div>
            </div>
          ) : (
            <div className="mb-4 rounded-xl border border-[#232327] bg-[#1a1a1e] px-4 py-3 text-sm text-[#9a9aa2]">
              Barcha vazifalar bajarilgan 🎉
            </div>
          )}

          <div className="mb-2 text-xs text-[#9a9aa2]">Kun progressi</div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-[#6b6b73]">06:00</span>
            <div className="relative h-1 flex-1 rounded-full bg-[#232327]">
              <div className="h-full rounded-full bg-[#ff8a3d]" style={{ width: `${dayProgress}%` }} />
            </div>
            <span className="text-[11px] text-[#6b6b73]">22:00</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[20px] border border-[#232327] bg-[#131316] p-[18px]">
            <div className="mb-4 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 A4 4 0 0 1 16 7 V11 A4 4 0 0 1 8 11 V7 A4 4 0 0 1 12 3 Z" />
                <path d="M6 11 A6 6 0 0 0 18 11" />
                <path d="M12 17 V21 M9 21 H15" />
              </svg>
              <span className="text-xs text-[#9a9aa2]">Streak</span>
            </div>
            <div className="text-[28px] font-bold">{combinedStreak} kun</div>
            <div className="mt-0.5 text-[11px] text-[#6b6b73]">Ketma-ket faol</div>
          </div>
          <div className="rounded-[20px] border border-[#232327] bg-[#131316] p-[18px]">
            <div className="mb-4 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
                <path d="M16 12.5 h3" />
              </svg>
              <span className="text-xs text-[#9a9aa2]">Balans</span>
            </div>
            <div className={`text-[22px] font-bold ${balance >= 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
              {balance >= 0 ? "+" : ""}
              {new Intl.NumberFormat("uz-UZ").format(balance)}
            </div>
            <div className="mt-0.5 text-[11px] text-[#6b6b73]">Bu oy, so&apos;m</div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-[20px] border border-[#232327] bg-[#131316] p-5">
          <div className="mb-3.5 text-sm font-semibold">So&apos;nggi faoliyat</div>
          <div className="flex flex-col gap-3.5 overflow-hidden">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: a.color }} />
                <div className="flex-1 truncate text-xs text-[#c9c9ce]">{a.label}</div>
                <div className="flex-shrink-0 text-[11px] text-[#6b6b73]">
                  {a.time.toLocaleDateString("uz-UZ")}
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="text-xs text-[#6b6b73]">Hozircha faoliyat yo&apos;q</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
