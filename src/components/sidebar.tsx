"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Bosh sahifa", icon: "🏠" },
  { href: "/tasks", label: "Vazifalar", icon: "✅" },
  { href: "/habits", label: "Odatlar", icon: "🔁" },
  { href: "/ibodat", label: "Ibodat", icon: "🕌" },
  { href: "/oqish", label: "O'qish", icon: "📚" },
  { href: "/moliya", label: "Moliya", icon: "💰" },
  { href: "/karyera", label: "Karyera", icon: "💼" },
  { href: "/media", label: "Media", icon: "🎬" },
  { href: "/analitika", label: "Analitika", icon: "📊" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 px-4 py-6">
      <div className="mb-8 px-2 text-xl font-bold text-slate-50">
        Hayot <span className="text-indigo-400">OS</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400"
      >
        Chiqish
      </button>
    </aside>
  );
}
