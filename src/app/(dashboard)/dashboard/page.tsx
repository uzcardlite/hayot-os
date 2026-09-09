import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [openTasks, doneToday] = await Promise.all([
    prisma.task.count({ where: { userId, status: { not: "DONE" } } }),
    prisma.task.count({
      where: {
        userId,
        status: "DONE",
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const stats = [
    { label: "Ochiq vazifalar", value: openTasks, href: "/tasks" },
    { label: "Bugun bajarilgan", value: doneToday, href: "/tasks" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-50">
        Xush kelibsiz, {session?.user?.name ?? session?.user?.email}
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        Bugungi holatingizga umumiy nazar.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-indigo-500"
          >
            <p className="text-3xl font-semibold text-slate-50">{s.value}</p>
            <p className="mt-1 text-sm text-slate-400">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-2 text-lg font-medium text-slate-100">
          Keyingi qadam
        </h2>
        <p className="text-sm text-slate-400">
          Odatlar, Ibodat, O&apos;qish, Moliya, Karyera, Media va Analitika
          modullari navbat bilan qo&apos;shiladi. Hozircha{" "}
          <Link href="/tasks" className="text-indigo-400 hover:underline">
            Vazifalar
          </Link>{" "}
          moduli orqali kunlik rejalaringizni boshqarishingiz mumkin.
        </p>
      </div>
    </div>
  );
}
