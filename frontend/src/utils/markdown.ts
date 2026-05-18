import { marked, type TokenizerAndRendererExtension } from "marked";
import DOMPurify from "dompurify";

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const highlightExt: TokenizerAndRendererExtension = {
  name: "highlight",
  level: "inline",
  start: (src) => src.indexOf("=="),
  tokenizer(src) {
    const red = src.match(/^===([\s\S]+?)===/);
    if (red)
      return { type: "highlight", raw: red[0], text: red[1], color: "red" };
    const yellow = src.match(/^==([\s\S]+?)==/);
    if (yellow)
      return { type: "highlight", raw: yellow[0], text: yellow[1], color: "yellow" };
  },
  renderer(token) {
    return `<mark class="mark--${token.color}">${token.text}</mark>`;
  },
};

const renderer = {
  code({ text, lang }: { text: string; lang?: string }) {
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : "";
    return `<pre>${langLabel}<code>${escapeHtml(text)}</code></pre>`;
  },
};

marked.use({ breaks: true, extensions: [highlightExt], renderer });

export function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(marked(content) as string);
}
