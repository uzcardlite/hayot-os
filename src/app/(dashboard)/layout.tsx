import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, onboardingCompleted: true },
  });

  if (!user?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0d] text-[#f5f4f2]">
      <div className="pointer-events-none fixed left-[320px] top-[-160px] h-[420px] w-[640px] rounded-full bg-[#ff8a3d] opacity-10 blur-[120px]" />

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex h-[76px] flex-shrink-0 items-center gap-5 border-b border-[#1c1c20] px-8">
          <div className="text-xl font-bold tracking-tight">
            Hayot <span className="text-[#ff8a3d]">OS</span>
          </div>

          <div className="ml-6 flex max-w-[420px] flex-1 items-center gap-2.5 rounded-xl border border-[#232327] bg-[#131316] px-4 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b73" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21 L16.5 16.5" />
            </svg>
            <span className="text-sm text-[#6b6b73]">Qidirish...</span>
          </div>

          <div className="flex-1" />

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#232327] bg-[#131316]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9.5 A6 6 0 0 1 18 9.5 C18 14 20 15 20 15 H4 C4 15 6 14 6 9.5 Z" />
              <path d="M10 18.5 A2 2 0 0 0 14 18.5" />
            </svg>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff8a3d] text-sm font-bold text-[#0a0a0d]">
            {initial}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
