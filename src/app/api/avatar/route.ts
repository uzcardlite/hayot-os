import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { avatarUrl } = await req.json();
  if (!avatarUrl) {
    return NextResponse.json({ error: "avatarUrl kerak" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  });

  return NextResponse.json({ ok: true });
}
