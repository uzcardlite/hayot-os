"use client";

import { useEffect, useState } from "react";

type Profile = { name: string | null; title: string | null; bio: string | null };
type Skill = { id: string; name: string; proficiency: number };
type Project = {
  id: string;
  title: string;
  description: string | null;
  tags: string | null;
  link: string | null;
};
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

export default function PortfolioPage() {
  const [profile, setProfile] = useState<Profile>({ name: null, title: null, bio: null });
  const [editingProfile, setEditingProfile] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(60);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTags, setProjTags] = useState("");
  const [projLink, setProjLink] = useState("");

  const [careerItems, setCareerItems] = useState<CareerItem[]>([]);
  const [ciTitle, setCiTitle] = useState("");
  const [ciCategory, setCiCategory] = useState("");
  const [ciDescription, setCiDescription] = useState("");
  const [ciLink, setCiLink] = useState("");

  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [profileRes, skillsRes, projectsRes, careerRes] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/skills"),
      fetch("/api/projects"),
      fetch("/api/career"),
    ]);
    setProfile(await profileRes.json());
    setSkills(await skillsRes.json());
    setProjects(await projectsRes.json());
    setCareerItems(await careerRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadAll();
  }, []);

  function startEditProfile() {
    setTitleDraft(profile.title ?? "");
    setBioDraft(profile.bio ?? "");
    setEditingProfile(true);
  }

  async function saveProfile() {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft, bio: bioDraft }),
    });
    setEditingProfile(false);
    loadAll();
  }

  async function addSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!skillName.trim()) return;
    await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: skillName, proficiency: skillLevel }),
    });
    setSkillName("");
    setSkillLevel(60);
    loadAll();
  }

  async function removeSkill(id: string) {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projTitle.trim()) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: projTitle,
        description: projDesc || null,
        tags: projTags || null,
        link: projLink || null,
      }),
    });
    setProjTitle("");
    setProjDesc("");
    setProjTags("");
    setProjLink("");
    loadAll();
  }

  async function removeProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function addCareerItem(e: React.FormEvent) {
    e.preventDefault();
    if (!ciTitle.trim() || !ciCategory.trim()) return;
    await fetch("/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: ciTitle,
        category: ciCategory,
        description: ciDescription || null,
        link: ciLink || null,
      }),
    });
    setCiTitle("");
    setCiCategory("");
    setCiDescription("");
    setCiLink("");
    loadAll();
  }

  async function removeCareerItem(id: string) {
    await fetch(`/api/career/${id}`, { method: "DELETE" });
    loadAll();
  }

  if (loading) {
    return <p className="text-[#8f8071]">Yuklanmoqda...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* profile header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-[72px] w-[72px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#f0965a] to-[#7a3d10]" />
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#f7f0e6]">
              {profile.name ?? "Siz"}
            </h1>
            {editingProfile ? (
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Lavozim / soha (masalan: Full-stack dasturchi)"
                className="mb-2 rounded-lg border border-[#332a1f] bg-[#1e1812] px-3 py-1.5 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
              />
            ) : (
              <div className="mb-2 text-sm font-semibold text-[#f0965a]">
                {profile.title || "Lavozimingizni qo'shing"}
              </div>
            )}
            {editingProfile ? (
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={2}
                placeholder="O'zingiz haqingizda qisqacha..."
                className="w-full max-w-md rounded-lg border border-[#332a1f] bg-[#1e1812] px-3 py-1.5 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
              />
            ) : (
              <p className="max-w-md text-sm text-[#baa898]">
                {profile.bio || "Bio qo'shilmagan"}
              </p>
            )}
          </div>
        </div>

        {editingProfile ? (
          <button
            onClick={saveProfile}
            className="flex-shrink-0 rounded-full bg-[#f0965a] px-5 py-2.5 text-sm font-semibold text-[#14100c]"
          >
            Saqlash
          </button>
        ) : (
          <button
            onClick={startEditProfile}
            className="flex-shrink-0 rounded-full border border-[#332a1f] bg-[#1e1812] px-5 py-2.5 text-sm font-medium text-[#d9cdbe]"
          >
            Tahrirlash
          </button>
        )}
      </div>

      {/* stat tiles */}
      <div className="mb-10 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#332a1f] bg-[#1e1812] p-4 text-center">
          <div className="text-2xl font-extrabold text-[#f7f0e6]">{projects.length}</div>
          <div className="mt-1 text-xs text-[#8f8071]">Loyiha</div>
        </div>
        <div className="rounded-2xl border border-[#332a1f] bg-[#1e1812] p-4 text-center">
          <div className="text-2xl font-extrabold text-[#f7f0e6]">{careerItems.length}</div>
          <div className="mt-1 text-xs text-[#8f8071]">Faoliyat yozuvi</div>
        </div>
        <div className="rounded-2xl border border-[#332a1f] bg-[#1e1812] p-4 text-center">
          <div className="text-2xl font-extrabold text-[#f7f0e6]">{skills.length}</div>
          <div className="mt-1 text-xs text-[#8f8071]">Ko&apos;nikma</div>
        </div>
      </div>

      {/* skills */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-bold text-[#f7f0e6]">Ko&apos;nikmalar</h2>

        <form onSubmit={addSkill} className="mb-4 flex flex-col gap-3 rounded-xl border border-[#332a1f] bg-[#1e1812] p-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Ko'nikma nomi..."
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          />
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={skillLevel}
              onChange={(e) => setSkillLevel(Number(e.target.value))}
              className="w-32 accent-[#f0965a]"
            />
            <span className="w-10 text-right text-xs text-[#baa898]">{skillLevel}%</span>
          </div>
          <button type="submit" className="rounded-lg bg-[#f0965a] px-4 py-2 text-sm font-semibold text-[#14100c]">
            Qo&apos;shish
          </button>
        </form>

        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.id} className="group">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-[#f7f0e6]">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#8f8071]">{s.proficiency}%</span>
                  <button onClick={() => removeSkill(s.id)} className="text-[#8f8071] opacity-0 hover:text-red-400 group-hover:opacity-100">✕</button>
                </div>
              </div>
              <div className="h-[5px] rounded-full bg-[#332a1f]">
                <div className="h-full rounded-full bg-[#f0965a]" style={{ width: `${s.proficiency}%` }} />
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-[#8f8071]">Hozircha ko&apos;nikma qo&apos;shilmagan.</p>
          )}
        </div>
      </section>

      {/* projects */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-bold text-[#f7f0e6]">Loyihalar</h2>

        <form onSubmit={addProject} className="mb-4 flex flex-col gap-3 rounded-xl border border-[#332a1f] bg-[#1e1812] p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Loyiha nomi..."
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
            />
            <input
              type="text"
              placeholder="Teglar (vergul bilan: Next.js, Prisma)"
              value={projTags}
              onChange={(e) => setProjTags(e.target.value)}
              className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
            />
          </div>
          <textarea
            placeholder="Qisqa tavsif (ixtiyoriy)"
            value={projDesc}
            onChange={(e) => setProjDesc(e.target.value)}
            rows={2}
            className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          />
          <input
            type="url"
            placeholder="Havola (ixtiyoriy)"
            value={projLink}
            onChange={(e) => setProjLink(e.target.value)}
            className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          />
          <button type="submit" className="rounded-lg bg-[#f0965a] py-2 text-sm font-semibold text-[#14100c]">
            Qo&apos;shish
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-[#332a1f] bg-[#1e1812]">
              <div className="h-[100px]" style={{ background: "linear-gradient(135deg, #332a1f, #1a140f)" }} />
              <div className="p-4">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#f7f0e6]">{p.title}</p>
                  <button onClick={() => removeProject(p.id)} className="text-[#8f8071] hover:text-red-400">✕</button>
                </div>
                {p.description && <p className="mb-2.5 text-xs leading-relaxed text-[#baa898]">{p.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {(p.tags ?? "").split(",").filter(Boolean).map((t) => (
                    <span key={t} className="rounded-full bg-[#332a1f] px-2 py-0.5 text-[10px] text-[#d9cdbe]">{t.trim()}</span>
                  ))}
                </div>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#f0965a] hover:underline">
                    {p.link}
                  </a>
                )}
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-[#8f8071]">Hozircha loyiha qo&apos;shilmagan.</p>
          )}
        </div>
      </section>

      {/* career timeline */}
      <section>
        <h2 className="mb-4 text-base font-bold text-[#f7f0e6]">Faoliyat tarixi</h2>

        <form onSubmit={addCareerItem} className="mb-4 flex flex-col gap-3 rounded-xl border border-[#332a1f] bg-[#1e1812] p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Sarlavha..."
              value={ciTitle}
              onChange={(e) => setCiTitle(e.target.value)}
              className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
            />
            <input
              type="text"
              list="career-category-suggestions"
              placeholder="Kategoriya"
              value={ciCategory}
              onChange={(e) => setCiCategory(e.target.value)}
              className="flex-1 rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
            />
            <datalist id="career-category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <textarea
            placeholder="Tavsif (ixtiyoriy)"
            value={ciDescription}
            onChange={(e) => setCiDescription(e.target.value)}
            rows={2}
            className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          />
          <input
            type="url"
            placeholder="Havola (ixtiyoriy)"
            value={ciLink}
            onChange={(e) => setCiLink(e.target.value)}
            className="rounded-lg border border-[#332a1f] bg-[#241d16] px-3 py-2 text-sm text-[#f7f0e6] outline-none focus:border-[#f0965a]"
          />
          <button type="submit" className="rounded-lg bg-[#f0965a] py-2 text-sm font-semibold text-[#14100c]">
            Qo&apos;shish
          </button>
        </form>

        <div className="flex flex-col">
          {careerItems.map((item, i) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex w-3 flex-shrink-0 flex-col items-center">
                <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#f0965a]" />
                {i < careerItems.length - 1 && <div className="w-px flex-1 bg-[#332a1f]" />}
              </div>
              <div className="min-w-0 flex-1 pb-6">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-[#f0965a2a] px-2 py-0.5 text-xs text-[#f0965a]">{item.category}</span>
                  <span className="text-xs text-[#8f8071]">{new Date(item.date).toLocaleDateString("uz-UZ")}</span>
                  <button onClick={() => removeCareerItem(item.id)} className="ml-auto text-[#8f8071] hover:text-red-400">✕</button>
                </div>
                <p className="text-sm font-semibold text-[#f7f0e6]">{item.title}</p>
                {item.description && <p className="mt-1 text-xs text-[#baa898]">{item.description}</p>}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#f0965a] hover:underline">
                    {item.link}
                  </a>
                )}
              </div>
            </div>
          ))}
          {careerItems.length === 0 && (
            <p className="text-sm text-[#8f8071]">Hozircha yozuv yo&apos;q.</p>
          )}
        </div>
      </section>
    </div>
  );
}
