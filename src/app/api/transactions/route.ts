import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const since = new Date();
  since.setMonth(since.getMonth() - 2);

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { amount, type, category, note, date } = await req.json();
  if (!amount || !type || !category) {
    return NextResponse.json(
      { error: "Summa, turi va kategoriya kerak" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount,
      type,
      category,
      note,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
