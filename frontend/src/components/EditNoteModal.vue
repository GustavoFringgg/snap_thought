<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop">
        <div
          class="modal"
          :style="`--day-color: var(${colorVar})`"
          role="dialog"
          aria-modal="true"
          :aria-label="`編輯 ${dayLabel} 筆記`"
        >
          <!-- Header -->
          <div class="modal__header">
            <div class="modal__title-row">
              <span class="modal__day-dot"></span>
              <span class="modal__day-label">{{ dayLabel }}</span>
              <span class="modal__hint">編輯筆記　Ctrl + Enter 儲存</span>
            </div>
            <button
              class="modal__close"
              aria-label="關閉"
              @click="$emit('close')"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <textarea
              ref="textareaRef"
              v-model="inputValue"
              class="modal__textarea"
              placeholder="輸入今天學到的內容..."
              @keydown.ctrl.enter="submit"
              @keydown.meta.enter="submit"
            ></textarea>

            <!-- Tag selector -->
            <div class="modal__tags">
              <span class="modal__tags-label">
                標籤 <span class="modal__tags-hint">（最多 2 個）</span>
              </span>
              <button
                v-for="t in NOTE_TAGS"
                :key="t"
                class="modal__tag-chip"
                :class="{
                  'modal__tag-chip--active': selectedTags.includes(t),
                  'modal__tag-chip--disabled': !selectedTags.includes(t) && selectedTags.length >= 2
                }"
                :style="selectedTags.includes(t) ? `background:${TAG_COLORS[t].bg};color:${TAG_COLORS[t].text};border-color:${TAG_COLORS[t].border}` : ''"
                :disabled="!selectedTags.includes(t) && selectedTags.length >= 2"
                @click="toggleTag(t)"
              >{{ t }}</button>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal__footer">
            <button class="modal__cancel-btn" @click="$emit('close')">取消</button>
            <button
              class="modal__submit-btn"
              :disabled="!inputValue.trim()"
              @click="submit"
            >
              儲存變更
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { NOTE_TAGS, TAG_COLORS } from "../types";
import type { Note, NoteTag } from "../types";

const props = defineProps<{
  show: boolean;
  note: Note | null;
  dayLabel: string;
  colorVar: string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [content: string, tags: NoteTag[]];
}>();

const inputValue = ref("");
const selectedTags = ref<NoteTag[]>([]);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

watch(
  () => props.show,
  async (val) => {
    if (val && props.note) {
      inputValue.value = props.note.content;
      selectedTags.value = props.note.tags ? [...props.note.tags] : [];
      await nextTick();
      textareaRef.value?.focus();
    }
  },
);

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function toggleTag(t: NoteTag) {
  const idx = selectedTags.value.indexOf(t);
  if (idx !== -1) {
    selectedTags.value = selectedTags.value.filter((tag) => tag !== t);
  } else if (selectedTags.value.length < 2) {
    selectedTags.value = [...selectedTags.value, t];
  }
}

function submit() {
  const content = inputValue.value.trim();
  if (!content) return;
  emit("submit", content, selectedTags.value);
  emit("close");
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
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.18),
    0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1080px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1.5px solid var(--day-color, var(--color-border));
}

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

.modal__hint {
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-surface-2);
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
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

.modal__body {
  padding: 20px;
  background: var(--color-surface-2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.modal__tags-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-right: 2px;
}

.modal__tags-hint {
  font-weight: 400;
  font-size: 11px;
}

.modal__tag-chip {
  padding: 3px 10px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.modal__tag-chip:hover:not(:disabled) {
  border-color: var(--color-text-muted);
  color: var(--color-text);
}

.modal__tag-chip--active {
  font-weight: 600;
}

.modal__tag-chip--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.modal__textarea {
  width: 100%;
  height: 600px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--color-text);
  resize: none;
  box-sizing: border-box;
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

.modal__textarea::placeholder {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 13px;
}

.modal__textarea:focus {
  outline: none;
  border-color: var(--day-color, var(--color-primary));
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--day-color, var(--color-primary)) 12%, transparent);
}

.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal__cancel-btn {
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

.modal__cancel-btn:hover {
  background: var(--color-surface-2);
}

.modal__submit-btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--day-color, var(--color-primary));
  color: white;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.modal__submit-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.modal__submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

@media (max-width: 1025px) {
  .modal-backdrop {
    padding: 8px;
  }

  .modal {
    height: 98dvh;
    max-height: 98dvh;
  }

  .modal__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .modal__textarea {
    flex: 1;
    height: auto;
    min-height: 0;
  }
}
</style>
