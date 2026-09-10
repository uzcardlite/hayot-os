"use client";

import { useEffect, useMemo, useState } from "react";

type AssetCategory = "HOME" | "CAR" | "INVESTMENT" | "CASH" | "OTHER";

type Asset = {
  id: string;
  name: string;
  category: AssetCategory;
  value: string;
  notes: string | null;
};

type Liability = {
  id: string;
  name: string;
  amount: string;
  notes: string | null;
};

const CATEGORY_LABEL: Record<AssetCategory, string> = {
  HOME: "Ko'chmas mulk",
  CAR: "Transport",
  INVESTMENT: "Investitsiya",
  CASH: "Naqd / bank",
  OTHER: "Boshqa",
};

function formatSum(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
}

export default function BoylikPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState<AssetCategory>("HOME");
  const [assetValue, setAssetValue] = useState("");

  const [liabName, setLiabName] = useState("");
  const [liabAmount, setLiabAmount] = useState("");

  async function loadAll() {
    const [assetsRes, liabRes] = await Promise.all([
      fetch("/api/assets"),
      fetch("/api/liabilities"),
    ]);
    setAssets(await assetsRes.json());
    setLiabilities(await liabRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadAll();
  }, []);

  async function addAsset(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(assetValue);
    if (!assetName.trim() || !value) return;
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: assetName, category: assetCategory, value }),
    });
    setAssetName("");
    setAssetValue("");
    loadAll();
  }

  async function removeAsset(id: string) {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function addLiability(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(liabAmount);
    if (!liabName.trim() || !amount) return;
    await fetch("/api/liabilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: liabName, amount }),
    });
    setLiabName("");
    setLiabAmount("");
    loadAll();
  }

  async function removeLiability(id: string) {
    await fetch(`/api/liabilities/${id}`, { method: "DELETE" });
    loadAll();
  }

  const totalAssets = useMemo(() => assets.reduce((s, a) => s + Number(a.value), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + Number(l.amount), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;
  const assetShare = totalAssets + totalLiabilities > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 50;

  if (loading) {
    return <p className="text-[#6b6b73]">Yuklanmoqda...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[#f5f4f2]">Boylik</h1>
          <p className="text-sm text-[#6b6b73]">
            Aktivlar va passivlaringizning umumiy ko&apos;rinishi
          </p>
        </div>
      </div>

      <div
        className="mb-8 rounded-3xl border border-[#232327] p-9"
        style={{ background: "linear-gradient(135deg, #1a140c, #131316)" }}
      >
        <div className="mb-2 text-xs text-[#9a9aa2]">Sof boylik</div>
        <div className="text-[36px] font-extrabold tracking-tight text-[#f5f4f2]">
          {formatSum(netWorth)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* assets */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#f5f4f2]">Aktivlar</h2>
            <span className="text-sm font-bold text-[#34d399]">{formatSum(totalAssets)}</span>
          </div>

          <form onSubmit={addAsset} className="mb-4 flex flex-col gap-2.5 rounded-xl border border-[#232327] bg-[#131316] p-3.5">
            <input
              type="text"
              placeholder="Nomi (masalan: Uy)"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="rounded-lg border border-[#232327] bg-[#1a1a1e] px-3 py-2 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
            />
            <div className="flex gap-2.5">
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                className="flex-1 rounded-lg border border-[#232327] bg-[#1a1a1e] px-3 py-2 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
              >
                {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Qiymati (so'm)"
                value={assetValue}
                onChange={(e) => setAssetValue(e.target.value)}
                className="flex-1 rounded-lg border border-[#232327] bg-[#1a1a1e] px-3 py-2 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
              />
            </div>
            <button type="submit" className="rounded-lg bg-[#ff8a3d] py-2 text-sm font-semibold text-[#0a0a0d]">
              + Aktiv qo&apos;shish
            </button>
          </form>

          <div className="flex flex-col gap-2.5">
            {assets.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-[#232327] bg-[#131316] px-4 py-3.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#f5f4f2]">{a.name}</p>
                  <p className="text-xs text-[#6b6b73]">{CATEGORY_LABEL[a.category]}</p>
                </div>
                <p className="text-sm font-bold text-[#f5f4f2]">{formatSum(Number(a.value))}</p>
                <button onClick={() => removeAsset(a.id)} className="text-[#6b6b73] hover:text-red-400">✕</button>
              </div>
            ))}
            {assets.length === 0 && <p className="text-sm text-[#6b6b73]">Hozircha aktiv qo&apos;shilmagan.</p>}
          </div>
        </div>

        {/* liabilities */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#f5f4f2]">Passivlar</h2>
            <span className="text-sm font-bold text-[#f87171]">{formatSum(totalLiabilities)}</span>
          </div>

          <form onSubmit={addLiability} className="mb-4 flex flex-col gap-2.5 rounded-xl border border-[#232327] bg-[#131316] p-3.5">
            <input
              type="text"
              placeholder="Nomi (masalan: Ipoteka krediti)"
              value={liabName}
              onChange={(e) => setLiabName(e.target.value)}
              className="rounded-lg border border-[#232327] bg-[#1a1a1e] px-3 py-2 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
            />
            <input
              type="number"
              placeholder="Qolgan summa (so'm)"
              value={liabAmount}
              onChange={(e) => setLiabAmount(e.target.value)}
              className="rounded-lg border border-[#232327] bg-[#1a1a1e] px-3 py-2 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
            />
            <button type="submit" className="rounded-lg bg-[#ff8a3d] py-2 text-sm font-semibold text-[#0a0a0d]">
              + Passiv qo&apos;shish
            </button>
          </form>

          <div className="flex flex-col gap-2.5">
            {liabilities.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-[#232327] bg-[#131316] px-4 py-3.5">
                <p className="flex-1 text-sm font-semibold text-[#f5f4f2]">{l.name}</p>
                <p className="text-sm font-bold text-[#f87171]">{formatSum(Number(l.amount))}</p>
                <button onClick={() => removeLiability(l.id)} className="text-[#6b6b73] hover:text-red-400">✕</button>
              </div>
            ))}
            {liabilities.length === 0 && <p className="text-sm text-[#6b6b73]">Hozircha passiv qo&apos;shilmagan.</p>}
          </div>

          {(totalAssets > 0 || totalLiabilities > 0) && (
            <div className="mt-4 rounded-2xl border border-dashed border-[#2b2b30] p-4 text-center text-xs text-[#6b6b73]">
              Aktivlar / passivlar nisbati
              <div className="mt-2.5 flex h-2 overflow-hidden rounded-full">
                <div className="bg-[#34d399]" style={{ width: `${assetShare}%` }} />
                <div className="bg-[#f87171]" style={{ width: `${100 - assetShare}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
