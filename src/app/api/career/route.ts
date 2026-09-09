import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const items = await prisma.careerItem.findMany({
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

  const { title, description, category, link, date } = await req.json();
  if (!title || !category) {
    return NextResponse.json(
      { error: "Sarlavha va kategoriya kerak" },
      { status: 400 }
    );
  }

  const item = await prisma.careerItem.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      category,
      link: link || null,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(item, { status: 201 });
}
