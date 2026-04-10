<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="note" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal" :style="`--day-color: var(${colorVar})`" role="dialog" aria-modal="true" :aria-label="`${dayLabel} 筆記詳情`">
          <!-- Header -->
          <div class="modal__header">
            <div class="modal__title-row">
              <span class="modal__day-dot"></span>
              <span class="modal__day-label">{{ dayLabel }}</span>
              <span class="modal__time">{{ formattedTime }}</span>
            </div>
            <button class="modal__close" aria-label="關閉" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <p class="modal__content">{{ note.content }}</p>
          </div>

          <!-- Footer -->
          <div class="modal__footer">
            <button
              class="modal__delete-btn"
              @click="handleDelete"
            >
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M6 6.5v3M8 6.5v3M3 3.5l.667 7a.5.5 0 0 0 .5.5h5.666a.5.5 0 0 0 .5-.5L11 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              刪除筆記
            </button>
            <button class="modal__close-btn" @click="$emit('close')">關閉</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '../types'

const props = defineProps<{
  note: Note | null
  dayLabel: string
  colorVar: string
}>()

const emit = defineEmits<{
  close: []
  delete: [id: string]
}>()

const formattedTime = computed(() => {
  if (!props.note) return ''
  const d = new Date(props.note.createdAt)
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
})

function handleDelete() {
  if (!props.note) return
  emit('delete', props.note.id)
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10);
  width: 100%;
  max-width: 1080px;
  height: 700px;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1.5px solid var(--color-border);
}

/* Header */
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal__day-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--day-color, var(--color-primary));
  flex-shrink: 0;
}

.modal__day-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.modal__time {
  font-size: 12px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.modal__close:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

/* Body */
.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: var(--color-surface-2);
}

.modal__content {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.85;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Footer */
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal__delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #FECACA;
  border-radius: var(--radius-sm);
  background: transparent;
  color: #EF4444;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.modal__delete-btn:hover {
  background: #FEE2E2;
  border-color: #FCA5A5;
}

.modal__close-btn {
  padding: 8px 20px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.modal__close-btn:hover {
  background: var(--color-surface-2);
  border-color: var(--color-text-muted);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 200ms ease, opacity 200ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal {
  transform: translateY(12px) scale(0.97);
  opacity: 0;
}
.modal-leave-to .modal {
  transform: translateY(8px) scale(0.97);
  opacity: 0;
}
</style>
