import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { title, description, tags, link } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "Sarlavha kerak" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      tags: tags || null,
      link: link || null,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
