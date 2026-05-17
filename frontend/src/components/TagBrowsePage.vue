<template>
  <div class="tag-page">

    <!-- Page header -->
    <div class="tag-page__header">
      <div class="tag-page__header-inner">
      </div>

      <!-- Tag filter chips -->
      <div class="tag-page__filter-wrap">
        <div class="tag-page__filter">
          <button
            class="tag-chip tag-chip--all"
            :class="{ 'tag-chip--active-all': !selectedTag }"
            @click="selectedTag = null"
          >
            全部
            <span class="tag-chip__count">{{ allNotes.length }}</span>
          </button>
          <button
            v-for="stat in tagStats"
            :key="stat.name"
            class="tag-chip"
            :class="{ 'tag-chip--active': selectedTag === stat.name }"
            :style="selectedTag === stat.name
              ? `background:${TAG_COLORS[stat.name].bg};color:${TAG_COLORS[stat.name].text};border-color:${TAG_COLORS[stat.name].border}`
              : `--chip-border:${TAG_COLORS[stat.name].border};--chip-text:${TAG_COLORS[stat.name].text}`"
            @click="selectedTag = selectedTag === stat.name ? null : stat.name"
          >
            {{ stat.name }}
            <span class="tag-chip__count">{{ stat.count }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Body: note list + random panel -->
    <div class="tag-page__body">

    <!-- Content -->
    <div class="tag-page__content">

      <!-- Loading -->
      <div v-if="loading" class="tag-page__loading">
        <div class="spinner"></div>
        <span>載入中...</span>
      </div>

      <!-- Empty: no tagged notes at all -->
      <div v-else-if="allNotes.length === 0" class="tag-page__empty">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="48" height="48" rx="12" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
          <path d="M18 28h20M18 34h14M18 22h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M34 14l8 8-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
        </svg>
        <p class="tag-page__empty-title">還沒有任何標籤</p>
        <p class="tag-page__empty-sub">新增筆記時幫它貼上標籤，就可以在這裡快速篩選</p>
      </div>

      <!-- Empty: selected tag has no results -->
      <div v-else-if="filteredNotes.length === 0" class="tag-page__empty">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <circle cx="28" cy="28" r="22" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
          <path d="M20 28h16M26 22l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
        </svg>
        <p class="tag-page__empty-title">沒有「{{ selectedTag }}」的筆記</p>
        <p class="tag-page__empty-sub">試試選擇其他標籤，或回到筆記新增標籤</p>
      </div>

      <!-- Results -->
      <template v-else>
        <!-- Grouped notes -->
        <div
          v-for="group in groupedNotes"
          :key="group.key"
          class="note-group"
        >
          <!-- Week separator -->
          <div class="note-group__header">
            <div class="note-group__line"></div>
            <div class="note-group__label">
              <span class="note-group__week">第 {{ group.isoWeek }} 週</span>
              <span class="note-group__dot">·</span>
              <span class="note-group__range">{{ group.dateRange }}</span>
              <span class="note-group__year">{{ group.year }}</span>
            </div>
            <div class="note-group__line"></div>
          </div>

          <!-- Note cards -->
          <div class="note-group__list">
            <div
              v-for="note in group.notes"
              :key="note.id"
              class="browse-card"
              :style="`--day-color: var(${DAY_INFO[note.dayKey].colorVar})`"
              @click="openNote(note)"
            >
              <div class="browse-card__bar"></div>
              <div class="browse-card__body">
                <div class="browse-card__meta">
                  <span v-if="note.tags && note.tags.length" class="browse-card__tags">
                    <span
                      v-for="tag in note.tags"
                      :key="tag"
                      class="browse-card__tag"
                      :style="tagStyle(tag)"
                    >{{ tag }}</span>
                  </span>
                </div>
                <p class="browse-card__content">{{ truncate(note.content) }}</p>
              </div>
              <div class="browse-card__arrow">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Random review panel -->
    <aside class="random-panel">
      <div class="random-panel__header">
        <span class="random-panel__title">隨機複習</span>
        <button class="random-panel__btn" :disabled="randomLoading" @click="fetchRandomNote" aria-label="再隨機一次">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" :class="{ 'spinning': randomLoading }">
            <path d="M13 2.5A6 6 0 1 1 7.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M13 2.5V6M13 2.5H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div v-if="randomLoading" class="random-panel__loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="!randomNote" class="random-panel__empty">
        還沒有任何筆記
      </div>

      <div v-else class="random-panel__card">
        <!-- Meta -->
        <div class="random-panel__meta">
          <span class="random-panel__day" :style="`color: var(${DAY_INFO[randomNote.dayKey].colorVar})`">
            {{ DAY_INFO[randomNote.dayKey].label }}
          </span>
          <span class="random-panel__week">第 {{ randomNote.isoWeek }} 週・{{ randomNote.year }}</span>
        </div>
        <!-- Tags -->
        <div v-if="randomNote.tags?.length" class="random-panel__tags">
          <span
            v-for="tag in randomNote.tags"
            :key="tag"
            class="random-panel__tag"
            :style="tagStyle(tag)"
          >{{ tag }}</span>
        </div>
        <!-- Content -->
        <div class="random-panel__content markdown-body" v-html="renderedRandomContent"></div>
      </div>
    </aside>

    </div><!-- end tag-page__body -->

    <!-- Note detail modal -->
    <NoteModal
      :note="selectedNote"
      :dayLabel="selectedNote ? DAY_INFO[selectedNote.dayKey].label : ''"
      :colorVar="selectedNote ? DAY_INFO[selectedNote.dayKey].colorVar : '--color-primary'"
      @close="selectedNote = null"
      @delete="handleDelete"
      @edit="handleEdit"
    />

    <EditNoteModal
      :show="!!editingNote"
      :note="editingNote"
      :dayLabel="editingNote ? DAY_INFO[editingNote.dayKey].label : ''"
      :colorVar="editingNote ? DAY_INFO[editingNote.dayKey].colorVar : '--color-primary'"
      @close="editingNote = null"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, toRef } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import NoteModal from './NoteModal.vue'
import EditNoteModal from './EditNoteModal.vue'
import { NOTE_TAGS, TAG_COLORS } from '../types'
import type { NoteTag, NoteWithContext, DayKey } from '../types'

const props = withDefaults(defineProps<{ searchQuery?: string }>(), { searchQuery: '' })

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

// ── Day metadata ─────────────────────────────────────────────────
const DAY_INFO: Record<DayKey, { label: string; colorVar: string }> = {
  mon: { label: '星期一', colorVar: '--color-monday' },
  tue: { label: '星期二', colorVar: '--color-tuesday' },
  wed: { label: '星期三', colorVar: '--color-wednesday' },
  thu: { label: '星期四', colorVar: '--color-thursday' },
  fri: { label: '星期五', colorVar: '--color-friday' },
}

const DAY_COLORS: Record<DayKey, string> = {
  mon: '#3B82F6',
  tue: '#8B5CF6',
  wed: '#10B981',
  thu: '#F59E0B',
  fri: '#EF4444',
}

// ── State ────────────────────────────────────────────────────────
const allNotes = ref<NoteWithContext[]>([])
const loading = ref(false)
const selectedTag = ref<NoteTag | null>(null)
const selectedNote = ref<NoteWithContext | null>(null)
const editingNote = ref<NoteWithContext | null>(null)
const randomNote = ref<NoteWithContext | null>(null)
const randomLoading = ref(false)

// ── Data fetching ────────────────────────────────────────────────
async function fetchNotes() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/v1/notes/by-tag`)
    const data = await res.json()
    allNotes.value = data.notes ?? []
  } catch (e) {
    console.error('Failed to fetch tagged notes:', e)
  } finally {
    loading.value = false
  }
}

async function fetchRandomNote() {
  randomLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/v1/notes/random`)
    if (res.ok) randomNote.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch random note:', e)
  } finally {
    randomLoading.value = false
  }
}

const renderedRandomContent = computed(() => {
  if (!randomNote.value) return ''
  return DOMPurify.sanitize(marked(randomNote.value.content) as string)
})

onMounted(() => { fetchNotes(); fetchRandomNote() })

// ── Tag stats ────────────────────────────────────────────────────
const tagStats = computed(() => {
  const counts = new Map<string, number>()
  for (const note of allNotes.value) {
    if (note.tags) {
      for (const tag of note.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
  }
  return NOTE_TAGS
    .filter(t => counts.has(t))
    .map(t => ({ name: t as NoteTag, count: counts.get(t)! }))
    .sort((a, b) => b.count - a.count)
})

// ── Filtered notes ───────────────────────────────────────────────
const filteredNotes = computed(() => {
  let notes = selectedTag.value
    ? allNotes.value.filter(n => n.tags?.includes(selectedTag.value!))
    : allNotes.value

  const q = props.searchQuery.trim().toLowerCase()
  if (q) notes = notes.filter(n => n.content.toLowerCase().includes(q))
  return notes
})

// ── Grouped by week ──────────────────────────────────────────────
interface NoteGroup {
  key: string
  year: number
  isoWeek: number
  dateRange: string
  notes: NoteWithContext[]
}

function getWeekRange(year: number, isoWeek: number): { monday: Date; friday: Date } {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = (jan4.getDay() + 6) % 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + (isoWeek - 1) * 7)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { monday, friday }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
}

const groupedNotes = computed<NoteGroup[]>(() => {
  const groups = new Map<string, NoteGroup>()
  for (const note of filteredNotes.value) {
    const key = `${note.year}-W${note.isoWeek}`
    if (!groups.has(key)) {
      const { monday, friday } = getWeekRange(note.year, note.isoWeek)
      groups.set(key, {
        key,
        year: note.year,
        isoWeek: note.isoWeek,
        dateRange: `${fmtDate(monday)} — ${fmtDate(friday)}`,
        notes: [],
      })
    }
    groups.get(key)!.notes.push(note)
  }
  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.isoWeek - a.isoWeek
  })
})

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
}

function truncate(text: string, max = 100): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

const FALLBACK_COLOR = { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' }

function tagStyle(tag: string): string {
  const c = TAG_COLORS[tag as NoteTag] ?? FALLBACK_COLOR
  return `background:${c.bg};color:${c.text};border-color:${c.border}`
}

function openNote(note: NoteWithContext) {
  selectedNote.value = note
}

function handleEdit() {
  editingNote.value = selectedNote.value
  selectedNote.value = null
}

async function handleEditSubmit(content: string, tags: NoteTag[]) {
  if (!editingNote.value) return
  const id = editingNote.value.id
  editingNote.value = null
  try {
    await fetch(`${API_BASE}/api/v1/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags: tags.length ? tags : undefined }),
    })
    allNotes.value = allNotes.value.map(n =>
      n.id === id ? { ...n, content, tags: tags.length ? tags : undefined } : n
    )
  } catch (e) {
    console.error('Failed to update note:', e)
  }
}

async function handleDelete(id: string) {
  try {
    await fetch(`${API_BASE}/api/v1/notes/${id}`, { method: 'DELETE' })
    allNotes.value = allNotes.value.filter(n => n.id !== id)
    selectedNote.value = null
  } catch (e) {
    console.error('Failed to delete note:', e)
  }
}

</script>

<style scoped>
.tag-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Body (two-column) ── */
.tag-page__body {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 0;
}

/* ── Header ── */
.tag-page__header {
  flex-shrink: 0;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 12px 28px 0;
  display: flex;
  align-items: center;
}

.tag-page__header-inner {
  display: none;
}

.tag-page__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.tag-page__subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.tag-page__header-stats {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.stat-pill {
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: var(--color-primary-light);
  padding: 6px 12px;
  border-radius: 20px;
}

.stat-pill--secondary {
  background: var(--color-surface-2);
}

.stat-pill__num {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-pill--secondary .stat-pill__num {
  color: var(--color-text-secondary);
}

.stat-pill__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
}

.stat-pill--secondary .stat-pill__label {
  color: var(--color-text-muted);
}

/* ── Tag filter ── */
.tag-page__filter-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -28px;
  padding: 0 28px;
  flex: 1;
}

.tag-page__filter-wrap::-webkit-scrollbar {
  display: none;
}

.tag-page__filter {
  display: flex;
  gap: 6px;
  padding: 8px 0;
  width: max-content;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.tag-chip:hover {
  border-color: var(--chip-border, var(--color-text-muted));
  color: var(--chip-text, var(--color-text));
}

.tag-chip--all:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-chip--active-all {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: white !important;
}

.tag-chip--active {
  font-weight: 600;
}

.tag-chip__count {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

/* ── Content ── */
.tag-page__content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

/* ── Random panel ── */
.random-panel {
  flex: 0 0 55%;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.random-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.random-panel__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.2px;
}

.random-panel__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.random-panel__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.random-panel__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.random-panel__btn svg.spinning {
  animation: spin 0.7s linear infinite;
}

.random-panel__loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.random-panel__empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

.random-panel__card {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.random-panel__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.random-panel__day {
  font-size: 12px;
  font-weight: 700;
}

.random-panel__week {
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.random-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.random-panel__tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
}

.random-panel__content {
  font-size: 18px;
  line-height: 1.75;
  color: var(--color-text);
  word-break: break-word;
}

/* ── Loading ── */
.tag-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Empty state ── */
.tag-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 80px 0;
  text-align: center;
}

.tag-page__empty svg {
  opacity: 0.25;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.tag-page__empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.tag-page__empty-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 300px;
  line-height: 1.6;
}

/* ── Result bar ── */
.tag-page__result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tag-page__result-count {
  font-size: 13px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-page__result-count strong {
  color: var(--color-text);
  font-weight: 600;
}

.tag-page__result-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
}

.tag-page__clear-btn {
  font-size: 12px;
  font-family: var(--font-sans);
  color: var(--color-text-muted);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all var(--transition);
}

.tag-page__clear-btn:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

/* ── Week group ── */
.note-group {
  margin-bottom: 28px;
}

.note-group__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.note-group__line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.note-group__label {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.note-group__week {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.3px;
}

.note-group__dot {
  color: var(--color-border);
  font-size: 12px;
}

.note-group__range {
  font-size: 12px;
  color: var(--color-text-muted);
}

.note-group__year {
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 1px 7px;
  font-variant-numeric: tabular-nums;
}

.note-group__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Browse card ── */
.browse-card {
  display: flex;
  align-items: stretch;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow var(--transition),
    transform var(--transition),
    border-color var(--transition);
}

.browse-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--day-color) 40%, var(--color-border));
}

.browse-card__bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--day-color, var(--color-primary));
}

.browse-card__body {
  flex: 1;
  padding: 12px 14px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.browse-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.browse-card__day-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.browse-card__date {
  font-size: 12px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.browse-card__spacer {
  flex: 1;
}

.browse-card__tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.browse-card__tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-sans);
}

.browse-card__content {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  word-break: break-word;
  white-space: pre-wrap;
}

.browse-card__arrow {
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity var(--transition);
  flex-shrink: 0;
}

.browse-card:hover .browse-card__arrow {
  opacity: 1;
  color: var(--day-color, var(--color-primary));
}

/* ── Responsive ── */
@media (max-width: 1025px) {
  .tag-page__header {
    padding: 8px 16px 0;
  }

  .tag-page__filter-wrap {
    margin: 0 -16px;
    padding: 0 16px;
    flex: 1;
  }

  .tag-page__content {
    padding: 20px 16px;
  }

  .tag-page__header-stats {
    display: none;
  }

  .browse-card__arrow {
    display: none;
  }

  .random-panel {
    display: none;
  }
}
</style>
