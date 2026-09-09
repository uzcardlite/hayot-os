import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/learning/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.learningItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const data: Record<string, unknown> = {
    title: body.title,
    type: body.type,
    notes: body.notes,
  };

  if (typeof body.progress === "number") {
    data.progress = Math.min(100, Math.max(0, body.progress));
  }

  if (body.status) {
    data.status = body.status;
    if (body.status === "IN_PROGRESS" && !existing.startedAt) {
      data.startedAt = new Date();
    }
    if (body.status === "DONE") {
      data.finishedAt = new Date();
      data.progress = 100;
    }
  }

  const item = await prisma.learningItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/learning/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.learningItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await prisma.learningItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
