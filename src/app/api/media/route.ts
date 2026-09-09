import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const items = await prisma.mediaLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { title, type, rating, notes } = await req.json();
  if (!title || !type) {
    return NextResponse.json(
      { error: "Sarlavha va turi kerak" },
      { status: 400 }
    );
  }

  const item = await prisma.mediaLog.create({
    data: {
      userId: session.user.id,
      title,
      type,
      rating: rating ?? null,
      notes: notes || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
