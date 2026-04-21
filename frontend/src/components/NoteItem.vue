<template>
  <div class="note-item" :style="`--day-color: var(${colorVar})`">
    <div class="note-item__bar"></div>
    <div class="note-item__body">
      <div class="note-item__main">
        <p
          class="note-item__content"
          :class="{ 'note-item__content--truncated': isLong }"
          @click="isLong ? $emit('expand', note) : undefined"
          :style="isLong ? 'cursor: pointer' : ''"
        >
          {{ displayContent }}
        </p>
        <span v-if="note.tags && note.tags.length" class="note-item__tags">
          <span
            v-for="tag in note.tags"
            :key="tag"
            class="note-item__tag"
            :style="`background:${TAG_COLORS[tag].bg};color:${TAG_COLORS[tag].text};border-color:${TAG_COLORS[tag].border}`"
            >{{ tag }}</span
          >
        </span>
      </div>
      <div class="note-item__footer">
        <div class="note-item__footer-left">
          <span class="note-item__time">{{ formattedTime }}</span>
          <button
            class="note-item__edit"
            aria-label="編輯這則筆記"
            @click="$emit('edit', note)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3 11H1v-2L8.5 1.5z"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            編輯
          </button>
        </div>
        <div class="note-item__actions">
          <button
            v-if="isLong"
            class="note-item__expand"
            aria-label="展開完整筆記"
            @click="$emit('expand', note)"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 8.5V11h2.5M11 4.5V2H8.5M4.5 2H2v2.5M8.5 11H11V8.5"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            展開
          </button>
          <button
            class="note-item__delete"
            aria-label="刪除這則筆記"
            @click="$emit('delete', note.id)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M6 6.5v3M8 6.5v3M3 3.5l.667 7a.5.5 0 0 0 .5.5h5.666a.5.5 0 0 0 .5-.5L11 3.5"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Note } from "../types";
import { TAG_COLORS } from "../types";

const TRUNCATE_LIMIT = 20;

const props = defineProps<{
  note: Note;
  colorVar: string;
}>();

defineEmits<{
  delete: [id: string];
  expand: [note: Note];
  edit: [note: Note];
}>();

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
}

const plainContent = computed(() => stripMarkdown(props.note.content))
const isLong = computed(() => plainContent.value.length > TRUNCATE_LIMIT);

const displayContent = computed(() =>
  isLong.value
    ? plainContent.value.slice(0, TRUNCATE_LIMIT) + "..."
    : plainContent.value,
);

const formattedTime = computed(() => {
  const d = new Date(props.note.createdAt);
  return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
});
</script>

<style scoped>
.note-item {
  display: flex;
  gap: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.note-item:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.note-item__bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--day-color, var(--color-primary));
}

.note-item__body {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.note-item__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.note-item__tags {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
}

.note-item__tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-sans);
  letter-spacing: 0.2px;
}

.note-item__content {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text);
  word-break: break-word;
  font-family: var(--font-sans);
}

.note-item__content--truncated:hover {
  color: var(--day-color, var(--color-primary));
}

.note-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.note-item__footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.note-item__time {
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.note-item__edit {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 7px;
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  transition: all var(--transition);
}

.note-item__edit:hover {
  border-color: var(--day-color, var(--color-primary));
  color: var(--day-color, var(--color-primary));
  background: color-mix(
    in srgb,
    var(--day-color, var(--color-primary)) 6%,
    transparent
  );
}

.note-item__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition);
}

.note-item:hover .note-item__actions {
  opacity: 1;
}

.note-item__expand,
.note-item__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 26px;
  padding: 0 7px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  transition: all var(--transition);
}

.note-item__expand:hover {
  background: var(--color-surface-2);
  color: var(--day-color, var(--color-primary));
}

.note-item__delete:hover {
  background: #fee2e2;
  color: #ef4444;
}
</style>
