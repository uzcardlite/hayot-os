import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 60,
      },
    },
  });

  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { title, targetDaysPerWeek } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "Sarlavha kerak" }, { status: 400 });
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      title,
      targetDaysPerWeek: targetDaysPerWeek ?? 7,
    },
  });

  return NextResponse.json({ ...habit, logs: [] }, { status: 201 });
}
