"use client";

import { useEffect, useState } from "react";

type MediaType = "MOVIE" | "SERIES" | "VIDEO" | "ARTICLE" | "PODCAST" | "OTHER";

type MediaItem = {
  id: string;
  title: string;
  type: MediaType;
  rating: number | null;
  notes: string | null;
  date: string;
};

const TYPE_LABEL: Record<MediaType, string> = {
  MOVIE: "Film",
  SERIES: "Serial",
  VIDEO: "Video",
  ARTICLE: "Maqola",
  PODCAST: "Podkast",
  OTHER: "Boshqa",
};

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("MOVIE");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  async function loadItems() {
    const res = await fetch("/api/media");
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

    await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        rating: rating || null,
        notes: notes || null,
      }),
    });

    setTitle("");
    setType("MOVIE");
    setRating(0);
    setNotes("");
    loadItems();
  }

  async function removeItem(id: string) {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    loadItems();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-[#f7f0e6]">Media</h1>
      <p className="mb-6 text-sm text-[#baa898]">
        Tomosha qilgan va o&apos;qigan kontentingizni jurnal sifatida saqlang.
      </p>

      <form
        onSubmit={addItem}
        className="mb-8 flex flex-col gap-3 rounded-xl border border-[#332a1f] bg-[#1e1812] p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Nomi..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MediaType)}
            className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          >
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n === rating ? 0 : n)}
              className={`text-xl ${n <= rating ? "text-[#f0965a]" : "text-[#8f8071]"}`}
            >
              ★
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Izoh (ixtiyoriy)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
        />

        <button
          type="submit"
          className="rounded-lg bg-[#f0965a] py-2 text-sm font-medium text-[#14100c] hover:bg-[#e0854a]"
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
              <div className="mb-1 flex items-start justify-between gap-3">
                <div>
                  <span className="mr-2 rounded-full bg-[#f0965a2a] px-2 py-0.5 text-xs text-[#f0965a]">
                    {TYPE_LABEL[item.type]}
                  </span>
                  <span className="text-xs text-[#8f8071]">
                    {new Date(item.date).toLocaleDateString("uz-UZ")}
                  </span>
                  <p className="mt-1 font-medium text-[#f7f0e6]">{item.title}</p>
                  {item.rating && (
                    <p className="text-sm text-[#f0965a]">
                      {"★".repeat(item.rating)}
                      <span className="text-[#8f8071]">
                        {"★".repeat(5 - item.rating)}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#8f8071] hover:text-[#f87171]"
                >
                  ✕
                </button>
              </div>

              {item.notes && (
                <p className="mt-1 text-sm text-[#baa898]">{item.notes}</p>
              )}
            </li>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-[#8f8071]">
              Hozircha hech narsa qo&apos;shilmagan. Yuqoridagi forma orqali
              birinchi film/kitob/videoingizni qo&apos;shing.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
