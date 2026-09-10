import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { name, category, value, notes } = await req.json();
  if (!name || !category || !value) {
    return NextResponse.json(
      { error: "Nomi, turi va qiymati kerak" },
      { status: 400 }
    );
  }

  const asset = await prisma.asset.create({
    data: {
      userId: session.user.id,
      name,
      category,
      value,
      notes: notes || null,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
