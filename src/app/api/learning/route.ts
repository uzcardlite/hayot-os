import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const items = await prisma.learningItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { startedAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { title, type } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "Sarlavha kerak" }, { status: 400 });
  }

  const item = await prisma.learningItem.create({
    data: {
      userId: session.user.id,
      title,
      type: type ?? "OTHER",
      status: "PLANNED",
      progress: 0,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
