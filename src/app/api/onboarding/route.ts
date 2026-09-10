import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const {
    gender,
    age,
    mainGoal,
    focusArea,
    wakeTime,
    sleepTime,
    prayerImportant,
    incomeRange,
    avatarUrl,
  } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      gender,
      age: age ? Number(age) : null,
      mainGoal,
      focusArea,
      wakeTime,
      sleepTime,
      prayerImportant: Boolean(prayerImportant),
      incomeRange,
      avatarUrl: avatarUrl || null,
      onboardingCompleted: true,
    },
  });

  return NextResponse.json({ ok: true, name: user.name });
}
