<template>
  <section
    class="day-card"
    :class="{ 'day-card--today': isToday, 'day-card--active': isActive }"
    :style="`--day-color: var(${day.colorVar})`"
    :aria-label="`${day.label} 的筆記`"
  >
    <!-- Card Header -->
    <div class="day-card__header">
      <div class="day-card__title-row">
        <div class="day-card__day-badge">
          <span class="day-card__day-name">{{ day.label }}</span>
          <span v-if="isToday" class="day-card__today-chip">今天</span>
        </div>
        <span class="day-card__count">{{ day.notes.length }} 則</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="day-card__input-section">
      <textarea
        v-model="inputValue"
        class="day-card__textarea"
        :aria-label="`輸入 ${day.label} 的學習筆記`"
        @keydown.ctrl.enter="addNote"
        @keydown.meta.enter="addNote"
      ></textarea>
    </div>

    <!-- Notes List -->
    <div class="day-card__notes" v-if="day.notes.length > 0">
      <div class="day-card__notes-header">
        <span class="day-card__notes-title">學習紀錄</span>
      </div>
      <div class="day-card__notes-list">
        <NoteItem
          v-for="note in reversedNotes"
          :key="note.id"
          :note="note"
          :colorVar="day.colorVar"
          @delete="deleteNote"
          @expand="openModal"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="day-card__empty">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="8"
          y="6"
          width="24"
          height="28"
          rx="4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-dasharray="3 2"
        />
        <path
          d="M14 14h12M14 19h8M14 24h6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <p>今天還沒有筆記</p>
    </div>

    <!-- Note Modal -->
    <NoteModal
      :note="selectedNote"
      :dayLabel="day.label"
      :colorVar="day.colorVar"
      @close="selectedNote = null"
      @delete="deleteNote"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import NoteItem from "./NoteItem.vue";
import NoteModal from "./NoteModal.vue";
import type { DayData, Note } from "../types";

const props = defineProps<{
  day: DayData;
  isToday: boolean;
  isActive: boolean;
}>();

const emit = defineEmits<{
  "add-note": [dayKey: DayData["key"], content: string];
  "delete-note": [dayKey: DayData["key"], noteId: string];
}>();

const inputValue = ref("");
const selectedNote = ref<Note | null>(null);

const reversedNotes = computed(() => [...props.day.notes].reverse());

function addNote() {
  const content = inputValue.value.trim();
  if (!content) return;
  emit("add-note", props.day.key, content);
  inputValue.value = "";
}

function deleteNote(id: string) {
  emit("delete-note", props.day.key, id);
}

function openModal(note: Note) {
  selectedNote.value = note;
}
</script>

<style scoped>
.day-card {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    box-shadow var(--transition),
    border-color var(--transition);
  box-shadow: var(--shadow-sm);
  height: 100%;
  min-height: 0;
}

.day-card--today {
  border-color: var(--day-color, var(--color-primary));
  box-shadow:
    0 0 0 3px
      color-mix(
        in srgb,
        var(--day-color, var(--color-primary)) 12%,
        transparent
      ),
    var(--shadow-md);
}

.day-card--active {
  border-color: var(--day-color, var(--color-primary));
}

/* Header */
.day-card__header {
  padding: 20px 20px 0;
  flex-shrink: 0;
}

.day-card__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.day-card__day-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-card__day-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--day-color, var(--color-primary));
  letter-spacing: -0.3px;
}

.day-card__today-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--day-color, var(--color-primary));
  color: white;
  letter-spacing: 0.3px;
}

.day-card__count {
  font-size: 12px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Input */
.day-card__input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  min-height: 0;
}

.day-card__textarea {
  flex: 1;
  width: 100%;
  min-height: 80px;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--color-text);
  resize: none;
  transition:
    border-color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
  appearance: none;
}

.day-card__textarea::placeholder {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 13px;
}

.day-card__textarea:focus {
  outline: none;
  border-color: var(--day-color, var(--color-primary));
  background: var(--color-surface);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--day-color, var(--color-primary)) 12%, transparent);
}

/* Notes */
.day-card__notes {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: 240px;
  flex-shrink: 0;
}

.day-card__notes-header {
  margin-bottom: 4px;
}

.day-card__notes-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-muted);
}

.day-card__notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Empty state */
.day-card__empty {
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.day-card__empty svg {
  opacity: 0.3;
  color: var(--color-text-muted);
}

.day-card__empty p {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.day-card__empty-sub {
  font-size: 12px !important;
  font-weight: 400 !important;
  color: var(--color-text-muted) !important;
}

@media (max-width: 768px) {
  .day-card__header {
    padding: 16px 16px 0;
  }

  .day-card__input-section {
    padding: 14px 16px;
  }

  .day-card__notes {
    padding: 14px 16px;
  }

  .day-card__day-name {
    font-size: 16px;
  }
}
</style>
