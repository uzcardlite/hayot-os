import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRAYER_NAMES = ["BOMDOD", "PESHIN", "ASR", "SHOM", "XUFTON"] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { date, prayer } = await req.json();
  if (!date || !PRAYER_NAMES.includes(prayer)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const day = new Date(date);

  const existing = await prisma.prayerLog.findUnique({
    where: {
      userId_date_prayer: { userId: session.user.id, date: day, prayer },
    },
  });

  if (existing) {
    await prisma.prayerLog.delete({ where: { id: existing.id } });
    return NextResponse.json({ completed: false });
  }

  await prisma.prayerLog.create({
    data: {
      userId: session.user.id,
      date: day,
      prayer,
      completed: true,
      onTime: true,
    },
  });

  return NextResponse.json({ completed: true });
}
