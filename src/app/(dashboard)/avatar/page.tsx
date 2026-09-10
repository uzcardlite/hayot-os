import Link from "next/link";

export default function AvatarSetupPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-[#f7f0e6]">
        3D avataringizni yarating
      </h1>
      <p className="mb-6 text-sm text-[#8f8071]">
        O&apos;zingizga o&apos;xshash qiyofa tanlang — bosh sahifangizda jonli
        360° ko&apos;rinishda chiqadi.
      </p>

      <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#332a1f] bg-[#1e1812] px-8 text-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8f8071" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4.2" />
          <path d="M5 21 C5 15.5 8 13 12 13 C16 13 19 15.5 19 21" />
        </svg>
        <p className="text-sm font-medium text-[#d9cdbe]">
          3D avatar yaratish hozircha mavjud emas
        </p>
        <p className="max-w-xs text-xs text-[#8f8071]">
          Bu funksiyani ta&apos;minlovchi xizmat yopilgani sababli vaqtincha
          o&apos;chirilgan. Tez orada boshqa provayder bilan qayta ishga
          tushadi.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm text-[#8f8071]"
      >
        ← Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
