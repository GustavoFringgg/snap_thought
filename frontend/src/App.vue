<template>
  <div class="app">
    <AppNavbar
      :days="days"
      :active-day="activeDay"
      @change-day="handleChangeDay"
    />

    <main class="main">
      <div class="main__inner">
        <!-- Page header -->
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title">學習筆記</h1>
            <div class="week-selector">
              <!-- Year dropdown -->
              <div class="select-wrap">
                <select
                  class="week-select"
                  :value="selectedYear"
                  @change="handleYearChange"
                  aria-label="選擇年份"
                >
                  <option v-for="y in yearOptions" :key="y" :value="y">
                    {{ y }} 年
                  </option>
                </select>
                <svg
                  class="select-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <!-- Week dropdown + prev/next -->
              <div class="week-nav">
                <button
                  class="week-nav__btn"
                  aria-label="上一週"
                  :disabled="!canGoPrev"
                  @click="goToPrevWeek"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                <div class="select-wrap">
                  <select
                    class="week-select week-select--wide"
                    :value="selectedWeekIndex"
                    @change="handleWeekChange"
                    aria-label="選擇週次"
                  >
                    <option v-for="w in weeks" :key="w.index" :value="w.index">
                      {{ w.label }}{{ w.isCurrentWeek ? " · 本週" : "" }}
                    </option>
                  </select>
                  <svg
                    class="select-icon"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <button
                  class="week-nav__btn"
                  aria-label="下一週"
                  :disabled="!canGoNext"
                  @click="goToNextWeek"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="page-header__stats">
            <div class="stat-chip">
              <span class="stat-chip__num">{{ totalNotes }}</span>
              <span class="stat-chip__label">則筆記</span>
            </div>
          </div>
        </div>

        <!-- Desktop: 5-column grid -->
        <div class="week-grid desktop-only">
          <DayCard
            v-for="day in days"
            :key="day.key"
            :day="day"
            :is-today="isCurrentWeek && todayKey === day.key"
            :is-active="activeDay === day.key"
            @add-note="handleAddNote"
            @delete-note="handleDeleteNote"
          />
        </div>

        <!-- Mobile: single active card -->
        <div class="mobile-only">
          <div class="mobile-day-nav">
            <button
              v-for="day in days"
              :key="day.key"
              class="mobile-day-btn"
              :class="{
                'mobile-day-btn--active': activeDay === day.key,
                'mobile-day-btn--today': isCurrentWeek && todayKey === day.key,
              }"
              :style="
                activeDay === day.key ? `--btn-color: var(${day.colorVar})` : ''
              "
              @click="handleChangeDay(day.key)"
            >
              {{ day.shortLabel }}
              <span
                v-if="isCurrentWeek && todayKey === day.key"
                class="mobile-today-dot"
              ></span>
            </button>
          </div>

          <DayCard
            v-if="activeDayData"
            :day="activeDayData"
            :is-today="isCurrentWeek && todayKey === activeDay"
            :is-active="true"
            @add-note="handleAddNote"
            @delete-note="handleDeleteNote"
          />
        </div>
      </div>
    </main>

    <footer class="footer">
      <span>Snop<strong>Thought</strong> — 邊學邊記，複習更有效</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from "vue";
import AppNavbar from "./components/AppNavbar.vue";
import DayCard from "./components/DayCard.vue";
import type { DayData, DayKey, Note, NoteTag } from "./types";

// ─── Week generation ───────────────────────────────────────────────
interface WeekRange {
  index: number;
  monday: Date;
  friday: Date;
  label: string;
  isCurrentWeek: boolean;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("zh-TW", { month: "long", day: "numeric" });
}

function generateWeeks(year: number): WeekRange[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks: WeekRange[] = [];
  // Find first Monday of the year
  const jan1 = new Date(year, 0, 1);
  const dow = jan1.getDay(); // 0=Sun
  const offset = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
  let cursor = new Date(year, 0, 1 + offset);

  let idx = 0;
  while (cursor.getFullYear() <= year) {
    const monday = new Date(cursor);
    const friday = new Date(cursor);
    friday.setDate(cursor.getDate() + 4);
    if (monday.getFullYear() > year) break;

    const isCurrentWeek = today >= monday && today <= friday;

    weeks.push({
      index: idx,
      monday,
      friday,
      label: `${fmtDate(monday)} — ${fmtDate(friday)}`,
      isCurrentWeek,
    });

    cursor.setDate(cursor.getDate() + 7);
    idx++;
  }
  return weeks;
}

function findCurrentWeekIndex(weekList: WeekRange[]): number {
  const week = weekList.find((w) => w.isCurrentWeek);
  return week ? week.index : (weekList[weekList.length - 1]?.index ?? 0);
}

// ─── ISO week helper ───────────────────────────────────────────────
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

// ─── Year / Week state ─────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

// 最早可選週：2026/03/23 (Mon)
const MIN_WEEK_DATE = new Date(2026, 2, 23);
MIN_WEEK_DATE.setHours(0, 0, 0, 0);

const selectedYear = ref(currentYear);
const weeks = computed(() =>
  generateWeeks(selectedYear.value).filter((w) => w.monday >= MIN_WEEK_DATE),
);
const selectedWeekIndex = ref(findCurrentWeekIndex(weeks.value));

const selectedWeek = computed(
  () =>
    weeks.value.find((w) => w.index === selectedWeekIndex.value) ??
    weeks.value[weeks.value.length - 1],
);
const isCurrentWeek = computed(
  () => selectedWeek.value?.isCurrentWeek ?? false,
);
const selectedIsoWeek = computed(() => getISOWeek(selectedWeek.value.monday));

// Reset week to first when year changes
watch(selectedYear, () => {
  const idx = findCurrentWeekIndex(weeks.value);
  selectedWeekIndex.value = idx;
});

// ─── Notes store (per week-day) ────────────────────────────────────
// Key: `${year}/${weekIndex}/${dayKey}`
const notesStore = reactive<Record<string, Note[]>>({});

function noteKey(year: number, weekIdx: number, dayKey: DayKey) {
  return `${year}/${weekIdx}/${dayKey}`;
}

// ─── Day definitions ───────────────────────────────────────────────
const DAY_DEFS: Omit<DayData, "notes">[] = [
  { key: "mon", label: "星期一", shortLabel: "一", colorVar: "--color-monday" },
  {
    key: "tue",
    label: "星期二",
    shortLabel: "二",
    colorVar: "--color-tuesday",
  },
  {
    key: "wed",
    label: "星期三",
    shortLabel: "三",
    colorVar: "--color-wednesday",
  },
  {
    key: "thu",
    label: "星期四",
    shortLabel: "四",
    colorVar: "--color-thursday",
  },
  { key: "fri", label: "星期五", shortLabel: "五", colorVar: "--color-friday" },
];

const days = computed<DayData[]>(() =>
  DAY_DEFS.map((d) => ({
    ...d,
    notes:
      notesStore[noteKey(selectedYear.value, selectedWeekIndex.value, d.key)] ??
      [],
  })),
);

const todayKey = computed<DayKey | null>(() => {
  const d = new Date().getDay();
  const map: Record<number, DayKey> = {
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
  };
  return map[d] ?? null;
});

const activeDay = ref<DayKey>(todayKey.value ?? "mon");
const activeDayData = computed(() =>
  days.value.find((d) => d.key === activeDay.value),
);
const totalNotes = computed(() =>
  days.value.reduce((sum, d) => sum + d.notes.length, 0),
);

// ─── API ───────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];

async function fetchWeekNotes() {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/notes?year=${selectedYear.value}&week=${selectedIsoWeek.value}`,
    );
    const data = await res.json();
    for (const dayKey of DAY_KEYS) {
      notesStore[noteKey(selectedYear.value, selectedWeekIndex.value, dayKey)] =
        data.days[dayKey] ?? [];
    }
  } catch (e) {
    console.error("Failed to fetch notes:", e);
  }
}

// ─── Handlers ──────────────────────────────────────────────────────
function handleChangeDay(key: DayKey) {
  activeDay.value = key;
}

function handleYearChange(e: Event) {
  selectedYear.value = Number((e.target as HTMLSelectElement).value);
}

function handleWeekChange(e: Event) {
  selectedWeekIndex.value = Number((e.target as HTMLSelectElement).value);
}

const canGoPrev = computed(() => {
  const currentPos = weeks.value.findIndex(
    (w) => w.index === selectedWeekIndex.value,
  );
  if (currentPos > 0) return true;
  // 可跨年往前
  const prevYearWeeks = generateWeeks(selectedYear.value - 1).filter(
    (w) => w.monday >= MIN_WEEK_DATE,
  );
  return prevYearWeeks.length > 0;
});

const canGoNext = computed(() => {
  const currentPos = weeks.value.findIndex(
    (w) => w.index === selectedWeekIndex.value,
  );
  if (currentPos < weeks.value.length - 1) return true;
  // 可跨年往後
  const nextYear = selectedYear.value + 1;
  return nextYear <= yearOptions[yearOptions.length - 1];
});

function goToPrevWeek() {
  const currentPos = weeks.value.findIndex(
    (w) => w.index === selectedWeekIndex.value,
  );
  if (currentPos > 0) {
    selectedWeekIndex.value = weeks.value[currentPos - 1].index;
  } else {
    // 跨年往前
    const prevYear = selectedYear.value - 1;
    const prevYearWeeks = generateWeeks(prevYear).filter(
      (w) => w.monday >= MIN_WEEK_DATE,
    );
    if (prevYearWeeks.length > 0) {
      selectedYear.value = prevYear;
      selectedWeekIndex.value = prevYearWeeks[prevYearWeeks.length - 1].index;
    }
  }
}

function goToNextWeek() {
  const currentPos = weeks.value.findIndex(
    (w) => w.index === selectedWeekIndex.value,
  );
  if (currentPos < weeks.value.length - 1) {
    selectedWeekIndex.value = weeks.value[currentPos + 1].index;
  } else {
    // 跨年往後
    const nextYear = selectedYear.value + 1;
    if (nextYear <= yearOptions[yearOptions.length - 1]) {
      selectedYear.value = nextYear;
      const nextYearWeeks = generateWeeks(nextYear).filter(
        (w) => w.monday >= MIN_WEEK_DATE,
      );
      if (nextYearWeeks.length > 0) {
        selectedWeekIndex.value = nextYearWeeks[0].index;
      }
    }
  }
}

async function handleAddNote(dayKey: DayKey, content: string, tag: NoteTag | null) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: selectedYear.value,
        week: selectedIsoWeek.value,
        dayKey,
        content,
        tag: tag ?? undefined,
      }),
    });
    const noteFromServer: Note = await res.json();
    const note: Note = { ...noteFromServer, tag: tag ?? undefined };
    const key = noteKey(selectedYear.value, selectedWeekIndex.value, dayKey);
    notesStore[key] = [...(notesStore[key] ?? []), note];
  } catch (e) {
    console.error("Failed to add note:", e);
  }
}

async function handleDeleteNote(dayKey: DayKey, noteId: string) {
  try {
    await fetch(`${API_BASE}/api/v1/notes/${noteId}`, { method: "DELETE" });
    const key = noteKey(selectedYear.value, selectedWeekIndex.value, dayKey);
    notesStore[key] = (notesStore[key] ?? []).filter((n) => n.id !== noteId);
  } catch (e) {
    console.error("Failed to delete note:", e);
  }
}

// ─── Fetch on week change ───────────────────────────────────────────
watch([selectedYear, selectedWeekIndex], fetchWeekNotes);
onMounted(fetchWeekNotes);
</script>

<style>
.app {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main__inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* Page header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header__title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--color-text);
  white-space: nowrap;
}

/* Week selector */
.week-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.week-nav__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}

.week-nav__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(37, 99, 235, 0.06);
}

.week-nav__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.week-select {
  appearance: none;
  -webkit-appearance: none;
  padding: 6px 28px 6px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

.week-select--wide {
  min-width: 190px;
}

.week-select:hover {
  border-color: var(--color-primary);
}

.week-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.select-icon {
  position: absolute;
  right: 9px;
  color: var(--color-text-muted);
  pointer-events: none;
}

/* Stat chip */
.stat-chip {
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: var(--color-primary-light);
  padding: 6px 14px;
  border-radius: 20px;
}

.stat-chip__num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-chip__label {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
}

/* Desktop grid */
.week-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  align-items: stretch;
  min-height: 0;
  height: 600px;
}

/* Mobile day nav */
.mobile-day-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.mobile-day-nav::-webkit-scrollbar {
  display: none;
}

.mobile-day-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 8px 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition);
}

.mobile-day-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.mobile-day-btn--active {
  background: var(--btn-color, var(--color-primary));
  border-color: var(--btn-color, var(--color-primary));
  color: white;
}

.mobile-today-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
}

.mobile-day-btn--active .mobile-today-dot {
  background: rgba(255, 255, 255, 0.9);
}

/* Responsive visibility */
.desktop-only {
  display: grid;
}

.mobile-only {
  display: none;
}

/* Footer */
.footer {
  text-align: center;
  padding: 16px 24px;
  font-size: 13px;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.footer strong {
  font-weight: 700;
  color: var(--color-text-secondary);
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .week-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .main {
    padding: 16px;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .page-header__title {
    font-size: 17px;
  }

  .week-select--wide {
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header__left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
