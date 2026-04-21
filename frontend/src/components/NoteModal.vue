<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="note" class="modal-backdrop">
        <div class="modal" :style="`--day-color: var(${colorVar})`" role="dialog" aria-modal="true" :aria-label="`${dayLabel} 筆記詳情`">
          <!-- Header -->
          <div class="modal__header">
            <div class="modal__title-row">
              <span class="modal__day-dot"></span>
              <span class="modal__day-label">{{ dayLabel }}</span>
              <span class="modal__time">{{ formattedTime }}</span>
              <span v-if="note.tags && note.tags.length" class="modal__tags">
                <span
                  v-for="tag in note.tags"
                  :key="tag"
                  class="modal__tag"
                  :style="`background:${TAG_COLORS[tag].bg};color:${TAG_COLORS[tag].text};border-color:${TAG_COLORS[tag].border}`"
                >{{ tag }}</span>
              </span>
            </div>
            <button class="modal__close" aria-label="關閉" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <div class="modal__content markdown-body" v-html="renderedContent"></div>
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
import { computed, onMounted, onUnmounted } from 'vue'
import { marked, type TokenizerAndRendererExtension } from 'marked'
import DOMPurify from 'dompurify'

const highlightExt: TokenizerAndRendererExtension = {
  name: 'highlight',
  level: 'inline',
  start: (src) => src.indexOf('='),
  tokenizer(src) {
    const red = src.match(/^==([^=]+)==/)
    if (red) return { type: 'highlight', raw: red[0], text: red[1], color: 'red' }
    const yellow = src.match(/^=([^=]+)=/)
    if (yellow) return { type: 'highlight', raw: yellow[0], text: yellow[1], color: 'yellow' }
  },
  renderer(token) {
    return `<mark class="mark--${token.color}">${token.text}</mark>`
  },
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const renderer = {
  code({ text, lang }: { text: string; lang?: string }) {
    const lines = text.split('\n').map((line, i) =>
      `<span class="code-line"><span class="line-number">${i + 1}</span><span class="line-content">${escapeHtml(line)}</span></span>`
    ).join('\n')
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : ''
    return `<pre>${langLabel}<code>${lines}</code></pre>`
  }
}

marked.use({ breaks: true, extensions: [highlightExt], renderer })
import { TAG_COLORS } from '../types'
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

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.note) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const renderedContent = computed(() => {
  if (!props.note) return ''
  return DOMPurify.sanitize(marked(props.note.content) as string)
})

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
  border: 0.8px solid var(--color-border);
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

.modal__tags {
  display: flex;
  gap: 4px;
  margin-left: 4px;
}

.modal__tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-sans);
  letter-spacing: 0.2px;
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
  font-size: 14px;
  line-height: 1.85;
  color: var(--color-text);
  word-break: break-word;
}

.modal__content :deep(h1),
.modal__content :deep(h2),
.modal__content :deep(h3),
.modal__content :deep(h4) {
  font-weight: 700;
  margin: 1em 0 0.4em;
  line-height: 1.3;
}

.modal__content :deep(h1) { font-size: 0.8em; }
.modal__content :deep(h2) { font-size: 0.85em; }
.modal__content :deep(h3) { font-size: 1.1em; }

.modal__content :deep(p) {
  margin: 0 0 0.75em;
}

.modal__content :deep(ul),
.modal__content :deep(ol) {
  padding-left: 0.8em;
  margin: 0 0 0.75em;
}

.modal__content :deep(li) {
  margin-bottom: 0.25em;
}

.modal__content :deep(code) {
  font-family: 'Consolas', 'Menlo', 'Monaco', var(--font-mono);
  font-size: 0.88em;
  background: #1e2030;
  color: #e4e9ff;
  border: 1px solid #2f3354;
  border-radius: 4px;
  padding: 0.1em 0.4em;
}

.modal__content :deep(pre) {
  background: #1e2030;
  border: 1px solid #2f3354;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 0 0 0.75em;
  position: relative;
  padding: 0;
}

.modal__content :deep(.code-lang) {
  display: block;
  padding: 4px 14px;
  font-size: 11px;
  font-family: 'Consolas', 'Menlo', var(--font-mono);
  color: #636d8f;
  border-bottom: 1px solid #2f3354;
  background: #191b2a;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.modal__content :deep(pre code) {
  display: block;
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 13px;
  color: #e4e9ff;
  line-height: 0.8;
}

.modal__content :deep(.code-line) {
  display: flex;
  min-height: 0.8em;
}

.modal__content :deep(.line-number) {
  user-select: none;
  min-width: 42px;
  padding: 0 16px 0 12px;
  text-align: right;
  color: #3b4261;
  flex-shrink: 0;
  border-right: 1px solid #2f3354;
  margin-right: 14px;
}

.modal__content :deep(.line-content) {
  flex: 1;
  padding-right: 16px;
  white-space: pre;
}

.modal__content :deep(blockquote) {
  border-left: 3px solid var(--day-color, var(--color-primary));
  margin: 0 0 0.75em;
  padding: 4px 0 4px 14px;
  color: var(--color-text-muted);
}

.modal__content :deep(strong) { font-weight: 700; }
.modal__content :deep(em) { font-style: italic; }

.modal__content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1em 0;
}

.modal__content :deep(a) {
  color: var(--day-color, var(--color-primary));
  text-decoration: underline;
}

.modal__content :deep(mark) {
  border-radius: 3px;
  padding: 0.05em 0.25em;
  color: #1a1a1a;
}

.modal__content :deep(mark.mark--yellow) {
  background: #fef08a;
}

.modal__content :deep(mark.mark--red) {
  background: #fecaca;
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
  border: 0.8px solid var(--color-border);
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

@media (max-width: 1025px) {
  .modal-backdrop {
    padding: 8px;
  }

  .modal {
    height: 98dvh;
    max-height: 98dvh;
  }
}
</style>
