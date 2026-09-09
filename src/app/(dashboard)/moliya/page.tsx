"use client";

import { useEffect, useMemo, useState } from "react";

type TransactionType = "INCOME" | "EXPENSE";

type Transaction = {
  id: string;
  amount: string;
  type: TransactionType;
  category: string;
  note: string | null;
  date: string;
};

const CATEGORY_SUGGESTIONS = [
  "Ish haqi",
  "Oziq-ovqat",
  "Transport",
  "Kommunal",
  "Kiyim",
  "Sog'liq",
  "O'yin-kulgi",
  "Boshqa",
];

function formatSum(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
}

export default function MoliyaPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  async function loadTransactions() {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadTransactions();
  }, []);

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || !category.trim()) return;

    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: value, type, category, note: note || null }),
    });

    setAmount("");
    setCategory("");
    setNote("");
    loadTransactions();
  }

  async function removeTransaction(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadTransactions();
  }

  const { income, expense, balance } = useMemo(() => {
    const now = new Date();
    const inThisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = inThisMonth
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = inThisMonth
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-50">Moliya</h1>
      <p className="mb-6 text-sm text-slate-400">
        Kirim-chiqimlaringizni kuzatib boring.
      </p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Bu oy kirim</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {formatSum(income)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Bu oy chiqim</p>
          <p className="mt-1 text-lg font-semibold text-red-400">
            {formatSum(expense)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Balans</p>
          <p
            className={`mt-1 text-lg font-semibold ${
              balance >= 0 ? "text-slate-100" : "text-red-400"
            }`}
          >
            {formatSum(balance)}
          </p>
        </div>
      </div>

      <form
        onSubmit={addTransaction}
        className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              type === "EXPENSE"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Chiqim
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              type === "INCOME"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Kirim
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            placeholder="Summa (so'm)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            list="category-suggestions"
            placeholder="Kategoriya"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <input
          type="text"
          placeholder="Izoh (ixtiyoriy)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
        <ul className="flex flex-col gap-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  t.type === "INCOME" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-slate-100">{t.category}</p>
                {t.note && <p className="text-xs text-slate-500">{t.note}</p>}
              </div>
              <p className="text-xs text-slate-500">
                {new Date(t.date).toLocaleDateString("uz-UZ")}
              </p>
              <p
                className={`w-32 text-right text-sm font-medium ${
                  t.type === "INCOME" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {t.type === "INCOME" ? "+" : "-"}
                {formatSum(Number(t.amount))}
              </p>
              <button
                onClick={() => removeTransaction(t.id)}
                className="text-slate-500 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}

          {transactions.length === 0 && (
            <p className="text-sm text-slate-600">
              Hozircha tranzaksiya yo&apos;q. Yuqoridagi forma orqali birinchi
              kirim yoki chiqimingizni qo&apos;shing.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
