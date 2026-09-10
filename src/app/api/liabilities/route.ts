import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const liabilities = await prisma.liability.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(liabilities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { name, amount, notes } = await req.json();
  if (!name || !amount) {
    return NextResponse.json(
      { error: "Nomi va qolgan summasi kerak" },
      { status: 400 }
    );
  }

  const liability = await prisma.liability.create({
    data: {
      userId: session.user.id,
      name,
      amount,
      notes: notes || null,
    },
  });

  return NextResponse.json(liability, { status: 201 });
}
