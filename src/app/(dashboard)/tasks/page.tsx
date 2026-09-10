"use client";

import { useEffect, useMemo, useState } from "react";
import { parseQuickAdd } from "@/lib/quick-add-parser";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  updatedAt: string;
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  LOW: "Past",
  MEDIUM: "O'rta",
  HIGH: "Yuqori",
};

const PRIORITY_WEIGHT: Record<Task["priority"], number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const DAY_LABELS = ["D", "S", "C", "P", "J", "J", "SH"];
const WEEKDAY_LABELS = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickInput, setQuickInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadTasks();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const parsed = parseQuickAdd(quickInput);
    if (!parsed.title) return;

    setSubmitting(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: parsed.title,
        dueDate: parsed.dueDate ? parsed.dueDate.toISOString() : null,
        priority: parsed.priority,
      }),
    });
    setSubmitting(false);
    setQuickInput("");
    loadTasks();
  }

  async function toggleStatus(task: Task) {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadTasks();
  }

  async function removeTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);

  const {
    overdue,
    dueToday,
    upcoming,
    someday,
    done,
    openCount,
    dueTodayCount,
    overdueCount,
    completionRate,
    priorityBreakdown,
    weeklyLoad,
    monthDays,
    recommended,
  } = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "DONE");
    const doneList = tasks.filter((t) => t.status === "DONE");

    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const upcoming: Task[] = [];
    const someday: Task[] = [];

    for (const t of open) {
      if (!t.dueDate) {
        someday.push(t);
        continue;
      }
      const due = startOfDay(new Date(t.dueDate));
      if (due < today) overdue.push(t);
      else if (due.getTime() === today.getTime()) dueToday.push(t);
      else upcoming.push(t);
    }

    const sortByPriority = (a: Task, b: Task) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    overdue.sort(sortByPriority);
    dueToday.sort(sortByPriority);
    upcoming.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    // smart score: priority weight * urgency weight
    function score(t: Task, urgency: number) {
      return PRIORITY_WEIGHT[t.priority] * urgency;
    }
    const scored = [
      ...overdue.map((t) => ({ t, s: score(t, 3) })),
      ...dueToday.map((t) => ({ t, s: score(t, 2) })),
      ...upcoming.map((t) => ({ t, s: score(t, 1) })),
      ...someday.map((t) => ({ t, s: score(t, 0.5) })),
    ].sort((a, b) => b.s - a.s);
    const recommended = scored[0]?.t ?? null;

    const since30 = new Date(today);
    since30.setDate(since30.getDate() - 30);
    const doneLast30 = doneList.filter((t) => new Date(t.updatedAt) >= since30).length;
    const completionRate =
      doneLast30 + open.length > 0 ? Math.round((doneLast30 / (doneLast30 + open.length)) * 100) : 0;

    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const t of open) priorityCounts[t.priority]++;
    const totalOpen = open.length || 1;
    const priorityBreakdown = {
      LOW: Math.round((priorityCounts.LOW / totalOpen) * 100),
      MEDIUM: Math.round((priorityCounts.MEDIUM / totalOpen) * 100),
      HIGH: Math.round((priorityCounts.HIGH / totalOpen) * 100),
    };

    const weeklyLoad = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      const count = open.filter((t) => t.dueDate && toDateKey(new Date(t.dueDate)) === key).length;
      return { date: d, count };
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const startWeekday = monthStart.getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dueDateKeys = new Set(
      open.filter((t) => t.dueDate).map((t) => toDateKey(new Date(t.dueDate!)))
    );
    const monthDays: { day: number | null; key: string | null; hasDue: boolean; overdue: boolean }[] = [];
    for (let i = 0; i < startWeekday; i++) monthDays.push({ day: null, key: null, hasDue: false, overdue: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(today.getFullYear(), today.getMonth(), d);
      const key = toDateKey(date);
      monthDays.push({ day: d, key, hasDue: dueDateKeys.has(key), overdue: date < today && dueDateKeys.has(key) });
    }

    return {
      overdue,
      dueToday,
      upcoming: upcoming.slice(0, 6),
      someday,
      done: doneList,
      openCount: open.length,
      dueTodayCount: dueToday.length,
      overdueCount: overdue.length,
      completionRate,
      priorityBreakdown,
      weeklyLoad,
      monthDays,
      recommended,
    };
  }, [tasks, today]);

  const maxWeeklyLoad = Math.max(1, ...weeklyLoad.map((d) => d.count));

  if (loading) {
    return <p className="text-[#8f8071]">Yuklanmoqda...</p>;
  }

  return (
    <div>
      {/* header + smart quick add */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[#f7f0e6]">Vazifalar</h1>
          <p className="text-sm text-[#8f8071]">
            Aqlli tartiblangan: kechikkan, bugungi va kelgusi vazifalar
          </p>
        </div>
        <form onSubmit={addTask} className="flex w-full flex-col gap-1 lg:w-[420px]">
          <div className="flex items-center gap-2.5 rounded-full border border-[#332a1f] bg-[#1e1812] py-1.5 pl-4.5 pr-1.5">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ertaga soat 15:00 shifokor..."
              className="flex-1 bg-transparent text-sm text-[#f7f0e6] placeholder:text-[#8f8071] outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f0965a] disabled:opacity-60"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14100c" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5 V19 M5 12 H19" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1.5 pl-4.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f0965a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 A4 4 0 0 1 16 7 V11 A4 4 0 0 1 8 11 V7 A4 4 0 0 1 12 3 Z" />
              <path d="M6 11 A6 6 0 0 0 18 11" />
              <path d="M12 17 V21 M9 21 H15" />
            </svg>
            <span className="text-[10px] text-[#8f8071]">
              Sana/vaqtni va ustuvorlikni matndan o&apos;zi taniydi (ertaga, juma, soat 15:00, muhim)
            </span>
          </div>
        </form>
      </div>

      {/* smart insight banner */}
      {overdueCount > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f0965a40] bg-[#241c13] px-4.5 py-3.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f0965a2a]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f0965a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 A4 4 0 0 1 16 7 V11 A4 4 0 0 1 8 11 V7 A4 4 0 0 1 12 3 Z" />
              <path d="M6 11 A6 6 0 0 0 18 11" />
              <path d="M12 17 V21 M9 21 H15" />
            </svg>
          </div>
          <span className="text-sm">
            <b>{overdueCount} ta vazifa kechikdi.</b> Avval ularni yakunlasangiz, kunning qolgan qismi
            yengillashadi.
          </span>
        </div>
      )}

      {/* recommended next task */}
      {recommended && (
        <div
          className="mb-6 flex items-center gap-5 rounded-3xl border border-[#f0965a55] p-5"
          style={{ background: "linear-gradient(135deg, #2a2013, #1e1812)" }}
        >
          <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl bg-[#f0965a]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14100c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 L4 14 H12 L11 22 L20 10 H12 Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-[10px] font-bold tracking-wide text-[#f0965a]">HOZIR ENG MUHIMI</div>
            <div className="truncate text-[15px] font-semibold">{recommended.title}</div>
            <div className="mt-0.5 text-xs text-[#baa898]">
              {PRIORITY_LABEL[recommended.priority]} ustuvorlik
              {recommended.dueDate &&
                (() => {
                  const due = startOfDay(new Date(recommended.dueDate));
                  const diffDays = Math.round((today.getTime() - due.getTime()) / 86400000);
                  if (diffDays > 0) return ` · ${diffDays} kun kechikdi`;
                  if (diffDays === 0) return " · bugun";
                  return ` · ${new Date(recommended.dueDate).toLocaleDateString("uz-UZ")}`;
                })()}
            </div>
          </div>
          <button
            onClick={() => toggleStatus(recommended)}
            className="flex-shrink-0 whitespace-nowrap rounded-full bg-[#f0965a] px-5 py-2.5 text-sm font-bold text-[#14100c]"
          >
            Hoziroq bajarish
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#332a1f] bg-[#1e1812] p-4.5">
          <div className="mb-2.5 text-[11px] text-[#baa898]">Ochiq vazifalar</div>
          <div className="text-[26px] font-extrabold">{openCount}</div>
          <div className="mt-1 text-[11px] text-[#8f8071]">hozirda faol</div>
        </div>
        <div className="rounded-2xl border border-[#332a1f] bg-[#1e1812] p-4.5">
          <div className="mb-2.5 text-[11px] text-[#baa898]">Bugun muddati</div>
          <div className="text-[26px] font-extrabold text-[#f0965a]">{dueTodayCount}</div>
          <div className="mt-1 text-[11px] text-[#8f8071]">bugun bajarilsin</div>
        </div>
        <div className="rounded-2xl border border-[#f8717155] bg-[#241712] p-4.5">
          <div className="mb-2.5 text-[11px] text-[#baa898]">Kechikkan</div>
          <div className="text-[26px] font-extrabold text-[#f87171]">{overdueCount}</div>
          <div className="mt-1 text-[11px] text-[#8f8071]">muddati o&apos;tgan</div>
        </div>
        <div className="rounded-2xl border border-[#332a1f] bg-[#1e1812] p-4.5">
          <div className="mb-2.5 text-[11px] text-[#baa898]">Bajarilish darajasi</div>
          <div className="text-[26px] font-extrabold text-[#34d399]">{completionRate}%</div>
          <div className="mt-1 text-[11px] text-[#8f8071]">so&apos;nggi 30 kun</div>
        </div>
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        {/* grouped task list */}
        <div className="flex flex-col gap-5">
          {overdueCount > 0 && (
            <TaskGroup
              label="KECHIKKAN"
              count={overdueCount}
              dotColor="#f87171"
              labelColor="#f87171"
              tasks={overdue}
              onToggle={toggleStatus}
              onRemove={removeTask}
              overdueTag
            />
          )}

          <TaskGroup
            label="BUGUN"
            count={dueTodayCount}
            dotColor="#f0965a"
            labelColor="#f0965a"
            tasks={dueToday}
            onToggle={toggleStatus}
            onRemove={removeTask}
          />

          <TaskGroup
            label="KELGUSI 7 KUN"
            count={upcoming.length}
            dotColor="#8f8071"
            labelColor="#baa898"
            tasks={upcoming}
            onToggle={toggleStatus}
            onRemove={removeTask}
            faded
          />

          {someday.length > 0 && (
            <TaskGroup
              label="MUDDATSIZ"
              count={someday.length}
              dotColor="#8f8071"
              labelColor="#baa898"
              tasks={someday}
              onToggle={toggleStatus}
              onRemove={removeTask}
              faded
            />
          )}

          {done.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                <span className="text-xs font-bold tracking-wide text-[#34d399]">BAJARILGAN · {done.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {done.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#332a1f] bg-[#1e1812]/50 px-4 py-3 opacity-60"
                  >
                    <button
                      onClick={() => toggleStatus(t)}
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md border-[1.5px] border-[#34d399] bg-[#34d399]"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#14100c" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 L10 17.5 L19 6.5" /></svg>
                    </button>
                    <span className="flex-1 text-sm line-through">{t.title}</span>
                    <button onClick={() => removeTask(t.id)} className="text-[#8f8071] hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {openCount === 0 && (
            <p className="text-sm text-[#8f8071]">Barcha vazifalar bajarilgan 🎉</p>
          )}
        </div>

        {/* right widgets */}
        <div className="flex flex-col gap-4.5">
          {/* mini calendar */}
          <div className="rounded-[20px] border border-[#332a1f] bg-[#1e1812] p-4.5">
            <div className="mb-3.5 text-sm font-bold">
              {today.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" })}
            </div>
            <div className="mb-1.5 grid grid-cols-7 gap-1">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="text-center text-[9px] text-[#8f8071]">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((d, i) => (
                <div key={i} className="flex h-7 flex-col items-center justify-center">
                  {d.day && (
                    <>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                          d.key === todayKey
                            ? "bg-[#f0965a] font-bold text-[#14100c]"
                            : d.overdue
                              ? "text-[#f87171]"
                              : "text-[#d9cdbe]"
                        }`}
                      >
                        {d.day}
                      </div>
                      {d.hasDue && d.key !== todayKey && (
                        <div
                          className="mt-0.5 h-[3px] w-[3px] rounded-full"
                          style={{ background: d.overdue ? "#f87171" : "#f0965a" }}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* priority breakdown */}
          {openCount > 0 && (
            <div className="rounded-[20px] border border-[#332a1f] bg-[#1e1812] p-4.5">
              <div className="mb-3.5 text-sm font-bold">Ustuvorlik taqsimoti</div>
              <div className="flex items-center gap-4.5">
                <svg width="80" height="80" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#332a1f" strokeWidth="12" />
                  {(() => {
                    const circumference = 238.8;
                    let offset = 0;
                    const segments = [
                      { pct: priorityBreakdown.HIGH, color: "#f87171" },
                      { pct: priorityBreakdown.MEDIUM, color: "#f0965a" },
                      { pct: priorityBreakdown.LOW, color: "#34d399" },
                    ];
                    return segments.map((seg, i) => {
                      const len = (seg.pct / 100) * circumference;
                      const el = (
                        <circle
                          key={i}
                          cx="48" cy="48" r="38" fill="none" stroke={seg.color} strokeWidth="12"
                          strokeDasharray={`${len} ${circumference - len}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 48 48)"
                        />
                      );
                      offset += len;
                      return el;
                    });
                  })()}
                </svg>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="h-2 w-2 rounded-sm bg-[#f87171]" />Yuqori — {priorityBreakdown.HIGH}%
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="h-2 w-2 rounded-sm bg-[#f0965a]" />O&apos;rta — {priorityBreakdown.MEDIUM}%
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="h-2 w-2 rounded-sm bg-[#34d399]" />Past — {priorityBreakdown.LOW}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* weekly workload heatmap */}
          <div className="rounded-[20px] border border-[#332a1f] bg-[#1e1812] p-4.5">
            <div className="mb-3 text-sm font-bold">Haftalik yuklanish</div>
            <div className="grid grid-cols-7 gap-1.5">
              {weeklyLoad.map((d, i) => {
                const intensity = d.count === 0 ? 0 : d.count >= maxWeeklyLoad ? 1 : 0.55;
                return (
                  <div
                    key={i}
                    title={`${d.count} ta vazifa`}
                    className="h-5.5 rounded-md"
                    style={{
                      background:
                        intensity === 0 ? "#3a3024" : intensity === 1 ? "#f0965a" : "#f0965a88",
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1.5">
              {weeklyLoad.map((d, i) => (
                <span key={i} className="text-center text-[9px] text-[#8f8071]">{WEEKDAY_LABELS[d.date.getDay()][0]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskGroup({
  label,
  count,
  dotColor,
  labelColor,
  tasks,
  onToggle,
  onRemove,
  faded,
  overdueTag,
}: {
  label: string;
  count: number;
  dotColor: string;
  labelColor: string;
  tasks: Task[];
  onToggle: (t: Task) => void;
  onRemove: (id: string) => void;
  faded?: boolean;
  overdueTag?: boolean;
}) {
  if (count === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
        <span className="text-xs font-bold tracking-wide" style={{ color: labelColor }}>
          {label} · {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 rounded-2xl border border-[#332a1f] bg-[#1e1812] px-4 py-3.5 ${faded ? "opacity-80" : ""}`}
          >
            <button
              onClick={() => onToggle(task)}
              className="h-[18px] w-[18px] flex-shrink-0 rounded-md border-[1.5px]"
              style={{ borderColor: overdueTag ? "#f87171" : dotColor }}
            />
            <span className="flex-1 truncate text-sm">{task.title}</span>
            <span
              className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px]"
              style={{
                background: task.priority === "HIGH" ? "#f871711f" : "#33282080",
                color: task.priority === "HIGH" ? "#f87171" : "#baa898",
              }}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.dueDate && (
              <span className="flex-shrink-0 text-[11px]" style={{ color: overdueTag ? "#f87171" : "#8f8071" }}>
                {new Date(task.dueDate).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button onClick={() => onRemove(task.id)} className="flex-shrink-0 text-[#8f8071] hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
