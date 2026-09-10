"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Bosh sahifa",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 L12 4 L21 11.5" />
        <path d="M5.5 10 V20 H18.5 V10" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Vazifalar",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11 L11 13 L15.5 8" />
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      </svg>
    ),
  },
  {
    href: "/habits",
    label: "Odatlar",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2 L21 6 L17 10" />
        <path d="M3 12 V10 A4 4 0 0 1 7 6 H21" />
        <path d="M7 22 L3 18 L7 14" />
        <path d="M21 12 V14 A4 4 0 0 1 17 18 H3" />
      </svg>
    ),
  },
  {
    href: "/ibodat",
    label: "Ibodat",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 15.5 A8.5 8.5 0 1 1 10 4.2 A6.8 6.8 0 0 0 20 15.5 Z" />
      </svg>
    ),
  },
  {
    href: "/oqish",
    label: "O'qish",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5 A2 2 0 0 1 6 3 H18 A1 1 0 0 1 19 4 V20 A1 1 0 0 1 18 21 H6 A2 2 0 0 1 4 19.5 Z" />
        <path d="M4 19.5 A2 2 0 0 1 6 18 H19" />
        <path d="M8 3 V18" />
      </svg>
    ),
  },
  {
    href: "/moliya",
    label: "Moliya",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
        <path d="M16 12.5 h3" />
      </svg>
    ),
  },
  {
    href: "/karyera",
    label: "Karyera",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
        <path d="M8 7 V5.2 A1.8 1.8 0 0 1 9.8 3.4 H14.2 A1.8 1.8 0 0 1 16 5.2 V7" />
      </svg>
    ),
  },
  {
    href: "/media",
    label: "Media",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.5 L16 12 L10 15.5 Z" fill={color} stroke="none" />
      </svg>
    ),
  },
  {
    href: "/analitika",
    label: "Analitika",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21 V13" />
        <path d="M4 9 V3" />
        <path d="M12 21 V11" />
        <path d="M12 7 V3" />
        <path d="M20 21 V15" />
        <path d="M20 11 V3" />
        <path d="M1.5 13 H6.5" />
        <path d="M9.5 7 H14.5" />
        <path d="M17.5 15 H22.5" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative z-10 flex w-[84px] flex-shrink-0 flex-col items-center gap-2 border-r border-[#1c1c20] py-6">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff8a3d]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#0a0a0d" />
        </svg>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              active ? "bg-[#ff8a3d2a]" : "hover:bg-[#131316]"
            }`}
          >
            {item.icon(active ? "#ff8a3d" : "#6b6b73")}
          </Link>
        );
      })}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Chiqish"
        className="mt-auto flex h-12 w-12 items-center justify-center rounded-2xl hover:bg-[#131316]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21 H5.5 A2 2 0 0 1 3.5 19 V5 A2 2 0 0 1 5.5 3 H9" />
          <path d="M16 17 L21 12 L16 7" />
          <path d="M21 12 H9" />
        </svg>
      </button>
    </aside>
  );
}
