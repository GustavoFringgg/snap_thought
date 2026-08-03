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
  | "FastAPI"
  | "Others"
  | "演算法"
  | "資料結構"
  | "Claude筆記"
  | "Nuxt"
  | "HTML"
  | "TODO"
  | "測試"
  | "SQLAlchemy"
  | "Pydantic"
  | "C#"
  | "ASP.NET"
  | "WinForm"
  | "Nooka筆記"

export const NOTE_TAGS: NoteTag[] = [
  "JS",
  "TS",
  "HTML",
  "CSS",
  "Git",
  "Vue",
  "Nuxt",
  "CICD",
  "Python",
  "Docker",
  "FastAPI",
  "SQLModel",
  "SQLAlchemy",
  "Pydantic",
  "C#",
  "ASP.NET",
  "WinForm",
  "Nooka筆記",
  "TailWind",
  "PostgreSQL",
  "Leetcode",
  "測試",
  "演算法",
  "資料結構",
  "Claude筆記",
  "Others",
  "TODO"
]

export const TAG_COLORS: Record<NoteTag, { bg: string; text: string; border: string }> = {
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
  FastAPI: { bg: "#ECFCCB", text: "#365314", border: "#84CC16" },
  演算法: { bg: "#f3dbce", text: "#ce9634", border: "#eec78e" },
  資料結構: { bg: "#F1F5F9", text: "#1E293B", border: "#64748B" },
  Claude筆記: { bg: "#FFF0E6", text: "#C4500A", border: "#F97316" },
  Nuxt: { bg: "#DCFCE7", text: "#14532D", border: "#00DC82" },
  HTML: { bg: "#FFF1EE", text: "#9A1200", border: "#E34F26" },
  TODO: { bg: "#FEFCE8", text: "#713F12", border: "#FACC15" },
  測試: { bg: "#F0FDF4", text: "#166534", border: "#4ADE80" },
  SQLAlchemy: { bg: "#FEF3C7", text: "#78350F", border: "#F59E0B" },
  Pydantic: { bg: "#EDE9FE", text: "#4C1D95", border: "#8B5CF6" },
  "C#": { bg: "#FDF0FF", text: "#7B1FA2", border: "#CE93D8" },
  "ASP.NET": { bg: "#E3F2FD", text: "#0D47A1", border: "#1976D2" },
  WinForm: { bg: "#ECEFF1", text: "#37474F", border: "#78909C" },
  Nooka筆記: { bg: "#EAF7F0", text: "#0B6E4F", border: "#2FAE73" }
}

export interface Note {
  id: string
  content: string
  createdAt: string
  tags?: NoteTag[]
}

export interface DayData {
  key: "mon" | "tue" | "wed" | "thu" | "fri"
  label: string
  shortLabel: string
  colorVar: string
  notes: Note[]
  reviewLabel: string
}

export type DayKey = DayData["key"]

export interface NoteWithContext extends Note {
  year: number
  isoWeek: number
  dayKey: DayKey
}
