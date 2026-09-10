"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarCreator } from "@/components/avatar-creator";

export default function AvatarSetupPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleComplete(url: string) {
    setSaving(true);
    await fetch("/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-[#f5f4f2]">
        3D avataringizni yarating
      </h1>
      <p className="mb-6 text-sm text-[#6b6b73]">
        O&apos;zingizga o&apos;xshash qiyofa tanlang — bosh sahifangizda jonli
        360° ko&apos;rinishda chiqadi.
      </p>

      <div className="h-[560px] overflow-hidden rounded-2xl border border-[#232327]">
        {saving ? (
          <div className="flex h-full items-center justify-center text-sm text-[#9a9aa2]">
            Saqlanmoqda...
          </div>
        ) : (
          <AvatarCreator onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
