export type NoteTag = 'JS' | 'TS' | 'Python' | 'Vue' | 'PostgreSQL' | 'SQLModel' | 'TailWind' | 'CSS' | 'Git' | 'Docker' | '後端框架' | 'Leetcode' | 'Others'

export const NOTE_TAGS: NoteTag[] = ['JS', 'TS', 'Python', 'Vue', 'PostgreSQL', 'SQLModel', 'TailWind', 'CSS', 'Git', 'Docker', '後端框架', 'Leetcode', 'Others']

export const TAG_COLORS: Record<NoteTag, { bg: string; text: string; border: string }> = {
  JS:         { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  TS:         { bg: '#DBEAFE', text: '#1E40AF', border: '#60A5FA' },
  Python:     { bg: '#E0E7FF', text: '#3730A3', border: '#818CF8' },
  Vue:        { bg: '#D1FAE5', text: '#065F46', border: '#34D399' },
  PostgreSQL: { bg: '#E0F2FE', text: '#075985', border: '#38BDF8' },
  SQLModel:   { bg: '#FFEDD5', text: '#9A3412', border: '#FB923C' },
  TailWind:   { bg: '#CCFBF1', text: '#0F766E', border: '#2DD4BF' },
  CSS:        { bg: '#F3E8FF', text: '#7E22CE', border: '#C084FC' },
  Git:        { bg: '#FFE4E6', text: '#9F1239', border: '#FB7185' },
  Docker:     { bg: '#CFFAFE', text: '#164E63', border: '#22D3EE' },
  '後端框架':  { bg: '#ECFCCB', text: '#365314', border: '#84CC16' },
  Leetcode:   { bg: '#FFF7ED', text: '#7C2D12', border: '#F97316' },
  Others:     { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
}

export interface Note {
  id: string
  content: string
  createdAt: string
  tags?: NoteTag[]
}

export interface DayData {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
  label: string
  shortLabel: string
  colorVar: string
  notes: Note[]
}

export type DayKey = DayData['key']

export interface NoteWithContext extends Note {
  year: number
  isoWeek: number
  dayKey: DayKey
}
