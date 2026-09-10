"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SECTIONS = [
  "Shaxsiy ma'lumotlar",
  "Maqsad va ustuvorliklar",
  "Kunlik tartib",
  "Ibodat va qadriyatlar",
  "Moliyaviy holat",
  "3D avatar yaratish",
];

const FOCUS_AREAS = ["Sog'liq", "Karyera", "Ibodat", "Moliya", "O'qish", "Oila"];
const INCOME_RANGES = [
  "1 mln so'mgacha",
  "1-3 mln so'm",
  "3-7 mln so'm",
  "7-15 mln so'm",
  "15 mln so'mdan yuqori",
];

type Gender = "MALE" | "FEMALE";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [gender, setGender] = useState<Gender>("MALE");
  const [age, setAge] = useState(25);
  const [mainGoal, setMainGoal] = useState("");
  const [focusArea, setFocusArea] = useState(FOCUS_AREAS[0]);
  const [wakeTime, setWakeTime] = useState("06:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [prayerImportant, setPrayerImportant] = useState(true);
  const [incomeRange, setIncomeRange] = useState(INCOME_RANGES[0]);

  async function finish(finalAvatarUrl: string | null) {
    setSubmitting(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender,
        age,
        mainGoal,
        focusArea,
        wakeTime,
        sleepTime,
        prayerImportant,
        incomeRange,
        avatarUrl: finalAvatarUrl,
      }),
    });
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0d] text-[#f5f4f2]">
        <div className="pointer-events-none absolute top-[-200px] left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#ff8a3d] opacity-10 blur-[140px]" />
        <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 text-center">
          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#ff8a3d]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a0a0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 L10 17.5 L20 6.5" />
            </svg>
          </div>
          <div className="mb-3 text-xs font-semibold tracking-widest text-[#ff8a3d]">
            PROFIL TAYYOR
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight">
            Sizning Hayot OS profilingiz shakllandi
          </h1>
          <p className="mb-10 max-w-md text-sm leading-relaxed text-[#9a9aa2]">
            Javoblaringiz asosida bosh sahifangiz va ustuvor modullaringiz
            sozlandi.
          </p>

          <div className="mb-10 grid w-full grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#232327] bg-[#131316] p-5 text-left">
              <div className="mb-2 text-[11px] text-[#6b6b73]">ASOSIY FOKUS</div>
              <div className="text-sm font-semibold">{focusArea}</div>
            </div>
            <div className="rounded-2xl border border-[#232327] bg-[#131316] p-5 text-left">
              <div className="mb-2 text-[11px] text-[#6b6b73]">UYQU TARTIBI</div>
              <div className="text-sm font-semibold">
                {sleepTime} — {wakeTime}
              </div>
            </div>
            <div className="rounded-2xl border border-[#232327] bg-[#131316] p-5 text-left">
              <div className="mb-2 text-[11px] text-[#6b6b73]">IBODAT</div>
              <div className="text-sm font-semibold">
                {prayerImportant ? "Muhim" : "Hozircha yo'q"}
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-full bg-[#ff8a3d] px-9 py-4 text-[15px] font-semibold text-[#0a0a0d]"
          >
            Bosh sahifaga o&apos;tish
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5 L16 12 L9 19" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0d] text-[#f5f4f2]">
      {/* left context panel */}
      <div className="relative hidden w-[420px] flex-shrink-0 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: "radial-gradient(120% 100% at 0% 0%, #1c1610 0%, #0d0d0f 55%)" }}
      >
        <div className="pointer-events-none absolute -top-28 -left-28 h-[380px] w-[380px] rounded-full bg-[#ff8a3d] opacity-10 blur-[100px]" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#ff8a3d]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#0a0a0d" />
            </svg>
          </div>
          <span className="text-base font-bold">Hayot OS</span>
        </div>

        <div className="relative z-10">
          <h1 className="mb-4 max-w-xs text-[28px] font-bold leading-tight tracking-tight">
            Hayotingizni birga tizimlashtiramiz
          </h1>
          <p className="mb-9 max-w-xs text-sm leading-relaxed text-[#9a9aa2]">
            Bir necha savolga javob bering — shunga qarab bosh sahifangiz siz
            uchun moslashtiriladi.
          </p>

          <div className="flex flex-col gap-3.5">
            {SECTIONS.map((section, i) => (
              <div key={section} className="flex items-center gap-3">
                {i < step ? (
                  <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px] bg-[#ff8a3d]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0d" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12.5 L10 17.5 L19 6.5" />
                    </svg>
                  </div>
                ) : i === step ? (
                  <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px] border border-[#3a2f22] bg-[#1e1a14]">
                    <span className="text-xs font-bold text-[#ff8a3d]">{i + 1}</span>
                  </div>
                ) : (
                  <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px] border border-[#232327] bg-[#18181c]">
                    <span className="text-xs font-bold text-[#6b6b73]">{i + 1}</span>
                  </div>
                )}
                <span
                  className={`text-sm ${
                    i === step ? "font-semibold text-[#f5f4f2]" : i < step ? "text-[#e8e7e4]" : "text-[#9a9aa2] opacity-60"
                  }`}
                >
                  {section}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#6b6b73]">
          Taxminan 3 daqiqa vaqt oladi
        </div>
      </div>

      {/* right question panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <div className="mb-9 flex items-center gap-2">
            {SECTIONS.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#ff8a3d]" : "bg-[#232327]"}`}
              />
            ))}
          </div>

          <div className="mb-2.5 text-xs font-semibold tracking-widest text-[#ff8a3d]">
            SAVOL {step + 1} / {SECTIONS.length}
          </div>

          {step === 0 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                Jinsingiz va yoshingiz?
              </h2>
              <p className="mb-8 text-sm text-[#6b6b73]">
                Profilingiz va tavsiyalar shunga moslashtiriladi
              </p>

              <div className="mb-6 grid grid-cols-2 gap-3.5">
                {(["MALE", "FEMALE"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`relative flex flex-col items-center gap-3 rounded-2xl border-[1.5px] p-5 ${
                      gender === g
                        ? "border-[#ff8a3d] bg-[#1e1a14]"
                        : "border-[#232327] bg-[#131316]"
                    }`}
                  >
                    {gender === g && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff8a3d]">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0a0d" strokeWidth="3" strokeLinecap="round">
                          <path d="M5 12.5 L10 17.5 L19 6.5" />
                        </svg>
                      </div>
                    )}
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={gender === g ? "#ff8a3d" : "#9a9aa2"} strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4.2" />
                      <path d="M5 21 C5 15.5 8 13 12 13 C16 13 19 15.5 19 21" />
                    </svg>
                    <span className={`text-sm font-semibold ${gender === g ? "text-[#f5f4f2]" : "text-[#c9c9ce]"}`}>
                      {g === "MALE" ? "Erkak" : "Ayol"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-9">
                <div className="mb-2.5 text-xs text-[#9a9aa2]">Yoshingiz</div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={12}
                    max={80}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="h-1.5 flex-1 accent-[#ff8a3d]"
                  />
                  <div className="flex h-10 w-14 items-center justify-center rounded-[10px] border border-[#232327] bg-[#131316] text-sm font-semibold">
                    {age}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                Asosiy maqsadingiz nima?
              </h2>
              <p className="mb-8 text-sm text-[#6b6b73]">
                Hozirgi eng katta ustuvorligingizni ayting
              </p>

              <input
                type="text"
                placeholder="Masalan: sog'lig'imni tiklash, karyerada o'sish..."
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="mb-8 w-full rounded-xl border border-[#232327] bg-[#131316] px-4 py-3 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
              />

              <div className="mb-2.5 text-xs text-[#9a9aa2]">Qaysi soha ustuvor?</div>
              <div className="grid grid-cols-3 gap-3">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => setFocusArea(area)}
                    className={`rounded-xl border-[1.5px] px-3 py-3 text-sm font-medium ${
                      focusArea === area
                        ? "border-[#ff8a3d] bg-[#1e1a14] text-[#f5f4f2]"
                        : "border-[#232327] bg-[#131316] text-[#c9c9ce]"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                Kunlik tartibingiz?
              </h2>
              <p className="mb-8 text-sm text-[#6b6b73]">
                Odatiy uyg&apos;onish va yotish vaqtingiz
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2.5 text-xs text-[#9a9aa2]">Uyg&apos;onish vaqti</div>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full rounded-xl border border-[#232327] bg-[#131316] px-4 py-3 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
                  />
                </div>
                <div>
                  <div className="mb-2.5 text-xs text-[#9a9aa2]">Yotish vaqti</div>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full rounded-xl border border-[#232327] bg-[#131316] px-4 py-3 text-sm text-[#f5f4f2] outline-none focus:border-[#ff8a3d]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                Ibodat sizning kundalik hayotingizda muhimmi?
              </h2>
              <p className="mb-8 text-sm text-[#6b6b73]">
                Bu Ibodat modulini sozlashda hisobga olinadi
              </p>

              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { v: true, l: "Ha, muhim" },
                  { v: false, l: "Hozircha yo'q" },
                ].map((opt) => (
                  <button
                    key={opt.l}
                    onClick={() => setPrayerImportant(opt.v)}
                    className={`rounded-2xl border-[1.5px] px-5 py-6 text-sm font-semibold ${
                      prayerImportant === opt.v
                        ? "border-[#ff8a3d] bg-[#1e1a14] text-[#f5f4f2]"
                        : "border-[#232327] bg-[#131316] text-[#c9c9ce]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                Oylik daromadingiz qaysi oraliqda?
              </h2>
              <p className="mb-8 text-sm text-[#6b6b73]">
                Moliya modulini sizga moslab boshlaymiz
              </p>

              <div className="flex flex-col gap-2.5">
                {INCOME_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setIncomeRange(range)}
                    className={`rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-medium ${
                      incomeRange === range
                        ? "border-[#ff8a3d] bg-[#1e1a14] text-[#f5f4f2]"
                        : "border-[#232327] bg-[#131316] text-[#c9c9ce]"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                3D avataringizni yarating
              </h2>
              <p className="mb-6 text-sm text-[#6b6b73]">
                O&apos;zingizga o&apos;xshash 3D qiyofa tanlang — bosh
                sahifangizda jonli 360° ko&apos;rinishda chiqadi
              </p>

              <div className="mb-6 flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#232327] bg-[#131316] px-8 text-center">
                {submitting ? (
                  <span className="text-sm text-[#9a9aa2]">Saqlanmoqda...</span>
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b6b73" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4.2" />
                      <path d="M5 21 C5 15.5 8 13 12 13 C16 13 19 15.5 19 21" />
                    </svg>
                    <p className="text-sm font-medium text-[#c9c9ce]">
                      3D avatar yaratish hozircha mavjud emas
                    </p>
                    <p className="max-w-xs text-xs text-[#6b6b73]">
                      Bu funksiyani ta&apos;minlovchi xizmat yopilgani sababli
                      vaqtincha o&apos;chirilgan. Tez orada boshqa provayder
                      bilan qayta ishga tushadi.
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={() => finish(null)}
                disabled={submitting}
                className="text-sm text-[#6b6b73] disabled:opacity-60"
              >
                Hozircha o&apos;tkazib yuborish →
              </button>
            </div>
          )}

          {step < 5 && (
            <div className="mt-9 flex items-center justify-between">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-sm text-[#6b6b73]"
                >
                  ← Ortga
                </button>
              ) : (
                <span />
              )}

              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 rounded-full bg-[#ff8a3d] px-6 py-3 text-sm font-semibold text-[#0a0a0d]"
              >
                Davom etish
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5 L16 12 L9 19" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
