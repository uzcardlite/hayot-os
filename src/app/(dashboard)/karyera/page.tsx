"use client";

import { useEffect, useState } from "react";

type CareerItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  date: string;
  link: string | null;
};

const CATEGORY_SUGGESTIONS = [
  "Loyiha",
  "Ish tajribasi",
  "Sertifikat",
  "Yutuq",
  "Konferensiya",
  "Boshqa",
];

export default function KaryeraPage() {
  const [items, setItems] = useState<CareerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  async function loadItems() {
    const res = await fetch("/api/career");
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
    if (!title.trim() || !category.trim()) return;

    await fetch("/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        description: description || null,
        link: link || null,
      }),
    });

    setTitle("");
    setCategory("");
    setDescription("");
    setLink("");
    loadItems();
  }

  async function removeItem(id: string) {
    await fetch(`/api/career/${id}`, { method: "DELETE" });
    loadItems();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-50">Karyera</h1>
      <p className="mb-6 text-sm text-slate-400">
        Loyihalar, ish tajribasi, sertifikatlar va yutuqlaringiz — portfolio
        sifatida.
      </p>

      <form
        onSubmit={addItem}
        className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Sarlavha..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            list="career-category-suggestions"
            placeholder="Kategoriya"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
          <datalist id="career-category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <textarea
          placeholder="Tavsif (ixtiyoriy)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />

        <input
          type="url"
          placeholder="Havola (ixtiyoriy, masalan: GitHub/LinkedIn)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Qo&apos;shish
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <div>
                  <span className="mr-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.date).toLocaleDateString("uz-UZ")}
                  </span>
                  <p className="mt-1 font-medium text-slate-100">{item.title}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>

              {item.description && (
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              )}

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-indigo-400 hover:underline"
                >
                  {item.link}
                </a>
              )}
            </li>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-slate-600">
              Hozircha hech narsa qo&apos;shilmagan. Yuqoridagi forma orqali
              birinchi yozuvingizni qo&apos;shing.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
