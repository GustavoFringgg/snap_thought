export type NoteTag =
  | "JS"
  | "TS"
  | "CSS"
  | "Git"
  | "Vue"
  | "CICD"
  | "Docker"
  | "Python"
  | "SQLModel"
  | "TailWind"
  | "Leetcode"
  | "PostgreSQL"
  | "後端框架"
  | "Others"
  | "演算法"
  | "資料結構";

export const NOTE_TAGS: NoteTag[] = [
  "JS",
  "TS",
  "Vue",
  "CICD",
  "Git",
  "CSS",
  "Python",
  "Docker",
  "SQLModel",
  "TailWind",
  "後端框架",
  "PostgreSQL",
  "Leetcode",
  "Others",
  "演算法",
  "資料結構",
];

export const TAG_COLORS: Record<
  NoteTag,
  { bg: string; text: string; border: string }
> = {
  JS: { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" },
  TS: { bg: "#DBEAFE", text: "#1E40AF", border: "#60A5FA" },
  Vue: { bg: "#D1FAE5", text: "#065F46", border: "#34D399" },
  Git: { bg: "#FFE4E6", text: "#9F1239", border: "#FB7185" },
  CSS: { bg: "#F3E8FF", text: "#7E22CE", border: "#C084FC" },
  Docker: { bg: "#CFFAFE", text: "#164E63", border: "#22D3EE" },
  CICD: { bg: "#e5ffe8", text: "#0689bd", border: "#045e66" },
  Python: { bg: "#E0E7FF", text: "#3730A3", border: "#818CF8" },
  SQLModel: { bg: "#FFEDD5", text: "#9A3412", border: "#FB923C" },
  TailWind: { bg: "#CCFBF1", text: "#0F766E", border: "#2DD4BF" },
  PostgreSQL: { bg: "#E0F2FE", text: "#075985", border: "#38BDF8" },
  Leetcode: { bg: "#FFF7ED", text: "#7C2D12", border: "#F97316" },
  Others: { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  後端框架: { bg: "#ECFCCB", text: "#365314", border: "#84CC16" },
  演算法: { bg: "#f3dbce", text: "#ce9634", border: "#eec78e" },
  資料結構: { bg: "#eded52", text: "#788ecf", border: "#0e5618" },
};

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  tags?: NoteTag[];
  id: string;
  content: string;
  createdAt: string;
  tags?: NoteTag[];
}

export interface DayData {
  key: "mon" | "tue" | "wed" | "thu" | "fri";
  label: string;
  shortLabel: string;
  colorVar: string;
  notes: Note[];
  key: "mon" | "tue" | "wed" | "thu" | "fri";
  label: string;
  shortLabel: string;
  colorVar: string;
  notes: Note[];
}

export type DayKey = DayData["key"];
export type DayKey = DayData["key"];

export interface NoteWithContext extends Note {
  year: number;
  isoWeek: number;
  dayKey: DayKey;
  year: number;
  isoWeek: number;
  dayKey: DayKey;
}
