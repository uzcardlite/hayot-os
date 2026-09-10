"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
  icon: (color: string) => React.ReactNode;
};

const HOME: NavItem = {
  href: "/dashboard",
  label: "Bosh sahifa",
  icon: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 L12 4 L21 11.5" />
      <path d="M5.5 10 V20 H18.5 V10" />
    </svg>
  ),
};

const GROUPS: NavItem[][] = [
  // Kunlik
  [
    {
      href: "/tasks",
      label: "Vazifalar",
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11 L11 13 L15.5 8" />
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        </svg>
      ),
    },
    {
      href: "/habits",
      label: "Odatlar",
      icon: (color) => (
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
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 15.5 A8.5 8.5 0 1 1 10 4.2 A6.8 6.8 0 0 0 20 15.5 Z" />
        </svg>
      ),
    },
  ],
  // Rivojlanish
  [
    {
      href: "/oqish",
      label: "O'qish",
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4.5 A2 2 0 0 1 6 3 H18 A1 1 0 0 1 19 4 V20 A1 1 0 0 1 18 21 H6 A2 2 0 0 1 4 19.5 Z" />
          <path d="M4 19.5 A2 2 0 0 1 6 18 H19" />
          <path d="M8 3 V18" />
        </svg>
      ),
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
          <circle cx="9.5" cy="10.5" r="2" />
          <path d="M6.5 16 C6.5 13.5 8 12.5 9.5 12.5 C11 12.5 12.5 13.5 12.5 16" />
          <path d="M15 10 H17.5" />
          <path d="M15 13.5 H17.5" />
        </svg>
      ),
    },
  ],
  // Moliya
  [
    {
      href: "/moliya",
      label: "Moliya",
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
          <path d="M16 12.5 h3" />
        </svg>
      ),
    },
    {
      href: "/boylik",
      label: "Boylik",
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5 V16.5" />
          <path d="M14.8 9.6 C14.8 8.3 13.6 7.5 12 7.5 C10.2 7.5 9 8.4 9 9.7 C9 12.3 14.8 11 14.8 13.7 C14.8 15 13.6 15.9 12 15.9 C10.4 15.9 9.2 15.1 9.2 13.8" />
        </svg>
      ),
    },
  ],
  // Hayot
  [
    {
      href: "/media",
      label: "Media",
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5 L16 12 L10 15.5 Z" fill={color} stroke="none" />
        </svg>
      ),
    },
  ],
  // Analitika
  [
    {
      href: "/analitika",
      label: "Analitika",
      icon: (color) => (
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
  ],
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
        active ? "bg-[#f0965a2a]" : "hover:bg-[#1e1812]"
      }`}
    >
      {item.icon(active ? "#f0965a" : "#8f8071")}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="relative z-10 flex w-[84px] flex-shrink-0 flex-col items-center gap-1.5 border-r border-[#281f17] py-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0965a]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#14100c" />
        </svg>
      </div>

      <NavLink item={HOME} active={isActive(HOME.href)} />

      {GROUPS.map((group, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="my-1.5 h-px w-7 bg-[#2a2119]" />
          {group.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      ))}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Chiqish"
        className="mt-auto flex h-12 w-12 items-center justify-center rounded-2xl hover:bg-[#1e1812]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8f8071" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21 H5.5 A2 2 0 0 1 3.5 19 V5 A2 2 0 0 1 5.5 3 H9" />
          <path d="M16 17 L21 12 L16 7" />
          <path d="M21 12 H9" />
        </svg>
      </button>
    </aside>
  );
}
