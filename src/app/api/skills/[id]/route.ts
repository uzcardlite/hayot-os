import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/skills/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.skill.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const skill = await prisma.skill.update({
    where: { id },
    data: { name: body.name, proficiency: body.proficiency },
  });

  return NextResponse.json(skill);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/skills/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.skill.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
