import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const skills = await prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: { proficiency: "desc" },
  });

  return NextResponse.json(skills);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { name, proficiency } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Nomi kerak" }, { status: 400 });
  }

  const skill = await prisma.skill.create({
    data: {
      userId: session.user.id,
      name,
      proficiency: proficiency ?? 50,
    },
  });

  return NextResponse.json(skill, { status: 201 });
}
