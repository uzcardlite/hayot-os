import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title,
      notes: body.notes,
      dueDate: body.dueDate ? new Date(body.dueDate) : body.dueDate,
      priority: body.priority,
      status: body.status,
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
