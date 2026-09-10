import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, title: true, bio: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { title, bio } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { title, bio },
  });

  return NextResponse.json({ title: user.title, bio: user.bio });
}
