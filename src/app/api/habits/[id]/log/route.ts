import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/habits/[id]/log">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { date } = await req.json();
  if (!date) {
    return NextResponse.json({ error: "Sana kerak" }, { status: 400 });
  }

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const day = new Date(date);

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId: id, date: day } },
  });

  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } });
    return NextResponse.json({ completed: false });
  }

  await prisma.habitLog.create({
    data: { habitId: id, userId: session.user.id, date: day, completed: true },
  });

  return NextResponse.json({ completed: true });
}
