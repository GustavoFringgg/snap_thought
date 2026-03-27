<template>
  <header class="navbar">
    <div class="navbar__inner">
      <div class="navbar__brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect width="28" height="28" rx="8" fill="#2563EB"/>
          <path d="M7 9h14M7 14h10M7 19h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <circle cx="21" cy="19" r="3.5" fill="#F97316"/>
        </svg>
        <span class="navbar__brand-name">Snop<span class="accent">Thought</span></span>
      </div>

      <!-- Desktop day tabs -->
      <nav class="navbar__tabs" role="tablist" aria-label="週間導覽">
        <button
          v-for="day in days"
          :key="day.key"
          class="navbar__tab"
          :class="{
            'navbar__tab--active': activeDay === day.key,
            'navbar__tab--today': isToday(day.key)
          }"
          :style="activeDay === day.key ? `--tab-color: var(${day.colorVar})` : ''"
          role="tab"
          :aria-selected="activeDay === day.key"
          @click="$emit('change-day', day.key)"
        >
          <span class="navbar__tab-short">{{ day.shortLabel }}</span>
          <span class="navbar__tab-full">{{ day.label }}</span>
          <span v-if="isToday(day.key)" class="today-dot" aria-label="今天"></span>
        </button>
      </nav>

      <div class="navbar__meta">
        <span class="navbar__week-label">Week {{ currentWeek }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DayKey, DayData } from '../types'

const props = defineProps<{
  days: DayData[]
  activeDay: DayKey
}>()

defineEmits<{
  'change-day': [day: DayKey]
}>()

const todayDayKey = computed<DayKey | null>(() => {
  const d = new Date().getDay() // 0=Sun, 1=Mon...5=Fri, 6=Sat
  const map: Record<number, DayKey> = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' }
  return map[d] ?? null
})

function isToday(key: DayKey) {
  return todayDayKey.value === key
}

const currentWeek = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7)
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
}

.navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.navbar__brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}

.navbar__brand-name .accent {
  color: var(--color-primary);
}

.navbar__tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.navbar__tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.navbar__tab:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.navbar__tab--active {
  background: var(--tab-color, var(--color-primary));
  color: white;
}

.navbar__tab--active:hover {
  background: var(--tab-color, var(--color-primary));
  filter: brightness(1.08);
  color: white;
}

.navbar__tab-short {
  display: none;
}

.navbar__tab-full {
  display: inline;
}

.today-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
}

.navbar__tab--active .today-dot {
  background: rgba(255,255,255,0.85);
}

.navbar__meta {
  flex-shrink: 0;
  margin-left: auto;
}

.navbar__week-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar__inner {
    padding: 0 16px;
    gap: 12px;
    height: 56px;
  }

  .navbar__brand-name {
    font-size: 15px;
  }

  .navbar__tab {
    padding: 6px 10px;
    font-size: 13px;
  }

  .navbar__tab-short {
    display: inline;
  }

  .navbar__tab-full {
    display: none;
  }

  .navbar__meta {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar__inner {
    gap: 8px;
  }

  .navbar__brand svg {
    width: 22px;
    height: 22px;
  }

  .navbar__brand-name {
    font-size: 14px;
  }

  .navbar__tab {
    padding: 5px 8px;
    font-size: 12px;
  }
}
</style>
