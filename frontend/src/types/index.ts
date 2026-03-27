export interface Note {
  id: string
  content: string
  createdAt: string
}

export interface DayData {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
  label: string
  shortLabel: string
  colorVar: string
  notes: Note[]
}

export type DayKey = DayData['key']
