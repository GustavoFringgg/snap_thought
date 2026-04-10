export type NoteTag = 'JS' | 'TS' | 'Python' | 'Vue' | 'PostgreSQL' | 'SQLModel' | 'Others'

export const NOTE_TAGS: NoteTag[] = ['JS', 'TS', 'Python', 'Vue', 'PostgreSQL', 'SQLModel', 'Others']

export const TAG_COLORS: Record<NoteTag, { bg: string; text: string; border: string }> = {
  JS:         { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
  TS:         { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  Python:     { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  Vue:        { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  PostgreSQL: { bg: '#E0F2FE', text: '#075985', border: '#7DD3FC' },
  SQLModel:   { bg: '#FED7AA', text: '#9A3412', border: '#FB923C' },
  Others:     { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
}

export interface Note {
  id: string
  content: string
  createdAt: string
  tag?: NoteTag
}

export interface DayData {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
  label: string
  shortLabel: string
  colorVar: string
  notes: Note[]
}

export type DayKey = DayData['key']
