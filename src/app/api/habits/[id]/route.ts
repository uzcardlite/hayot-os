import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/habits/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.habit.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      title: body.title,
      targetDaysPerWeek: body.targetDaysPerWeek,
      archived: body.archived,
    },
  });

  return NextResponse.json(habit);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/habits/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.habit.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await prisma.habit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
