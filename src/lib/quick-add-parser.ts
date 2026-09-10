export type ParsedQuickAdd = {
  title: string;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

const WEEKDAYS = [
  "yakshanba",
  "dushanba",
  "seshanba",
  "chorshanba",
  "payshanba",
  "juma",
  "shanba",
];

export function parseQuickAdd(raw: string): ParsedQuickAdd {
  let text = raw.trim();
  let dueDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (/\bbugun\b/i.test(text)) {
    dueDate = new Date(today);
    text = text.replace(/\bbugun\b/i, "").trim();
  } else if (/\bertaga\b/i.test(text)) {
    dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 1);
    text = text.replace(/\bertaga\b/i, "").trim();
  } else if (/\bindinga\b/i.test(text)) {
    dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 2);
    text = text.replace(/\bindinga\b/i, "").trim();
  } else {
    for (let i = 0; i < WEEKDAYS.length; i++) {
      const re = new RegExp(`\\b${WEEKDAYS[i]}(?:si|kuni)?\\b`, "i");
      if (re.test(text)) {
        const d = new Date(today);
        let diff = (i - d.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        d.setDate(d.getDate() + diff);
        dueDate = d;
        text = text.replace(re, "").trim();
        break;
      }
    }
  }

  const timeMatch = text.match(/\bsoat\s*(\d{1,2})(?:[:.](\d{2}))?\b/i);
  if (timeMatch) {
    const hours = Math.min(23, parseInt(timeMatch[1], 10));
    const minutes = timeMatch[2] ? Math.min(59, parseInt(timeMatch[2], 10)) : 0;
    const base = dueDate ?? new Date(today);
    base.setHours(hours, minutes, 0, 0);
    dueDate = base;
    text = text.replace(timeMatch[0], "").trim();
  }

  let priority: ParsedQuickAdd["priority"] = "MEDIUM";
  if (/\b(muhim|yuqori)\b/i.test(text)) {
    priority = "HIGH";
    text = text.replace(/\b(muhim|yuqori)\b/i, "").trim();
  } else if (/\bpast\b/i.test(text)) {
    priority = "LOW";
    text = text.replace(/\bpast\b/i, "").trim();
  }

  text = text.replace(/\s{2,}/g, " ").trim();

  return { title: text, dueDate, priority };
}
