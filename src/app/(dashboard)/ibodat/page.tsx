"use client";

import { useEffect, useState } from "react";

type PrayerName = "BOMDOD" | "PESHIN" | "ASR" | "SHOM" | "XUFTON";

type PrayerLog = {
  id: string;
  date: string;
  prayer: PrayerName;
  completed: boolean;
};

const PRAYERS: { key: PrayerName; label: string }[] = [
  { key: "BOMDOD", label: "Bomdod" },
  { key: "PESHIN", label: "Peshin" },
  { key: "ASR", label: "Asr" },
  { key: "SHOM", label: "Shom" },
  { key: "XUFTON", label: "Xufton" },
];

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

export default function IbodatPage() {
  const [logs, setLogs] = useState<PrayerLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    const res = await fetch("/api/prayers");
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadLogs();
  }, []);

  async function toggle(prayer: PrayerName, date: Date) {
    await fetch("/api/prayers/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayer, date: toDateKey(date) }),
    });
    loadLogs();
  }

  const days = last7Days();
  const todayKey = toDateKey(new Date());

  const doneSet = new Set(
    logs.filter((l) => l.completed).map((l) => `${l.date.slice(0, 10)}_${l.prayer}`)
  );

  const streak = (() => {
    let s = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (;;) {
      const key = toDateKey(cursor);
      const allDone = PRAYERS.every((p) => doneSet.has(`${key}_${p.key}`));
      if (!allDone) break;
      s++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return s;
  })();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-[#f7f0e6]">Ibodat</h1>
      <p className="mb-2 text-sm text-[#baa898]">
        Har kungi 5 vaqt namozingizni belgilab boring.
      </p>
      {streak > 0 && (
        <p className="mb-6 text-sm text-[#f0965a]">
          🔥 {streak} kun ketma-ket barcha namozlar to&apos;liq
        </p>
      )}

      {loading ? (
        <p className="text-[#8f8071]">Yuklanmoqda...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#332a1f] bg-[#1e1812] p-4">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium uppercase tracking-wide text-[#8f8071]">
                  Namoz
                </th>
                {days.map((d) => (
                  <th
                    key={toDateKey(d)}
                    className={`p-2 text-xs font-medium ${
                      toDateKey(d) === todayKey ? "text-[#f0965a]" : "text-[#8f8071]"
                    }`}
                  >
                    {DAY_LABELS[d.getDay()]}
                    <div className="text-[10px] text-[#8f8071]">{d.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRAYERS.map((prayer) => (
                <tr key={prayer.key}>
                  <td className="p-2 text-left text-sm font-medium text-[#f7f0e6]">
                    {prayer.label}
                  </td>
                  {days.map((d) => {
                    const key = toDateKey(d);
                    const done = doneSet.has(`${key}_${prayer.key}`);
                    return (
                      <td key={key} className="p-1.5">
                        <button
                          onClick={() => toggle(prayer.key, d)}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                            done
                              ? "bg-[#34d399] text-[#14100c]"
                              : "bg-[#241d16] text-[#8f8071] hover:bg-[#332a1f]"
                          }`}
                        >
                          {done ? "✓" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
