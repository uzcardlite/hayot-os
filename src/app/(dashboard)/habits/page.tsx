"use client";

import { useEffect, useState } from "react";

type HabitLog = {
  id: string;
  date: string;
  completed: boolean;
};

type Habit = {
  id: string;
  title: string;
  targetDaysPerWeek: number;
  logs: HabitLog[];
};

const DAY_LABELS = ["D", "S", "C", "P", "J", "J", "SH"];

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function last7Days() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function computeStreak(logs: HabitLog[]) {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date.slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (completedDates.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [targetDays, setTargetDays] = useState(7);

  async function loadHabits() {
    const res = await fetch("/api/habits");
    const data = await res.json();
    setHabits(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadHabits();
  }, []);

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetDaysPerWeek: targetDays }),
    });

    setTitle("");
    setTargetDays(7);
    loadHabits();
  }

  async function toggleDay(habitId: string, date: Date) {
    await fetch(`/api/habits/${habitId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: toDateKey(date) }),
    });
    loadHabits();
  }

  async function removeHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    loadHabits();
  }

  const days = last7Days();
  const todayKey = toDateKey(new Date());

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-50">Odatlar</h1>
      <p className="mb-6 text-sm text-slate-400">
        Kunlik odatlaringizni kuzating, streak saqlab qoling.
      </p>

      <form
        onSubmit={addHabit}
        className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          placeholder="Yangi odat (masalan: Sport)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <select
          value={targetDays}
          onChange={(e) => setTargetDays(Number(e.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              Haftada {n} kun
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Qo&apos;shish
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const streak = computeStreak(habit.logs);
            const completedKeys = new Set(
              habit.logs.filter((l) => l.completed).map((l) => l.date.slice(0, 10))
            );

            return (
              <div
                key={habit.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-100">{habit.title}</p>
                    <p className="text-xs text-slate-500">
                      Haftada {habit.targetDaysPerWeek} kun maqsad
                      {streak > 0 && (
                        <span className="ml-2 text-amber-400">
                          🔥 {streak} kunlik streak
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-2">
                  {days.map((d) => {
                    const key = toDateKey(d);
                    const done = completedKeys.has(key);
                    const isToday = key === todayKey;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleDay(habit.id, d)}
                        className={`flex h-10 w-10 flex-col items-center justify-center rounded-lg text-xs font-medium transition ${
                          done
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                        } ${isToday ? "ring-2 ring-indigo-400" : ""}`}
                        title={key}
                      >
                        {DAY_LABELS[d.getDay()]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {habits.length === 0 && (
            <p className="text-sm text-slate-600">
              Hozircha odat qo&apos;shilmagan. Yuqoridagi forma orqali birinchi
              odatingizni qo&apos;shing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
