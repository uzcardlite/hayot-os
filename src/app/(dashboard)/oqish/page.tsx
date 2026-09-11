"use client";

import { useEffect, useState } from "react";

type ItemType = "BOOK" | "COURSE" | "SKILL" | "OTHER";
type ItemStatus = "PLANNED" | "IN_PROGRESS" | "DONE" | "DROPPED";

type LearningItem = {
  id: string;
  title: string;
  type: ItemType;
  status: ItemStatus;
  progress: number;
};

const TYPE_LABEL: Record<ItemType, string> = {
  BOOK: "Kitob",
  COURSE: "Kurs",
  SKILL: "Ko'nikma",
  OTHER: "Boshqa",
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  PLANNED: "Rejalashtirilgan",
  IN_PROGRESS: "Jarayonda",
  DONE: "Tugallangan",
  DROPPED: "Tashlab qo'yilgan",
};

const STATUS_COLOR: Record<ItemStatus, string> = {
  PLANNED: "bg-[#332a1f] text-[#f7f0e6]",
  IN_PROGRESS: "bg-[#f0965a2a] text-[#f0965a]",
  DONE: "bg-[#34d3991f] text-[#34d399]",
  DROPPED: "bg-[#f871711f] text-[#f87171]",
};

export default function OqishPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ItemType>("BOOK");

  async function loadItems() {
    const res = await fetch("/api/learning");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadItems();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await fetch("/api/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type }),
    });

    setTitle("");
    setType("BOOK");
    loadItems();
  }

  async function updateItem(id: string, patch: Record<string, unknown>) {
    await fetch(`/api/learning/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    loadItems();
  }

  async function removeItem(id: string) {
    await fetch(`/api/learning/${id}`, { method: "DELETE" });
    loadItems();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-[#f7f0e6]">O&apos;qish</h1>
      <p className="mb-6 text-sm text-[#baa898]">
        Kitoblar, kurslar va ko&apos;nikmalaringizni kuzatib boring.
      </p>

      <form
        onSubmit={addItem}
        className="mb-8 flex flex-col gap-3 rounded-xl border border-[#332a1f] bg-[#1e1812] p-4 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          placeholder="Kitob, kurs yoki ko'nikma nomi..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ItemType)}
          className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
        >
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#f0965a] px-4 py-2 text-sm font-medium text-[#14100c] hover:bg-[#e0854a]"
        >
          Qo&apos;shish
        </button>
      </form>

      {loading ? (
        <p className="text-[#8f8071]">Yuklanmoqda...</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#332a1f] bg-[#1e1812] p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8f8071]">
                    {TYPE_LABEL[item.type]}
                  </span>
                  <p className="font-medium text-[#f7f0e6]">{item.title}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#8f8071] hover:text-[#f87171]"
                >
                  ✕
                </button>
              </div>

              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#241d16]">
                <div
                  className="h-full rounded-full bg-[#f0965a] transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[item.status]}`}
                >
                  {STATUS_LABEL[item.status]}
                </span>

                <select
                  value={item.status}
                  onChange={(e) => updateItem(item.id, { status: e.target.value })}
                  className="rounded-lg border border-[#332a1f] bg-[#241d16] px-2 py-1 text-xs text-[#f7f0e6] outline-none focus:border-[#f0965a]"
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={item.progress}
                  onChange={(e) =>
                    updateItem(item.id, { progress: Number(e.target.value) })
                  }
                  className="ml-auto w-32 accent-[#f0965a]"
                />
                <span className="w-10 text-right text-xs text-[#baa898]">
                  {item.progress}%
                </span>
              </div>
            </li>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-[#8f8071]">
              Hozircha hech narsa qo&apos;shilmagan. Yuqoridagi forma orqali
              birinchi kitob yoki kursingizni qo&apos;shing.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
