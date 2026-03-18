/**
 * Lightweight markdown-to-HTML converter for blog content.
 * Handles the subset of Markdown used by EcoTrade blog posts:
 *  - Paragraphs (blank-line-separated)
 *  - **bold** and *italic* inline formatting
 *  - # / ## headings
 *  - Standalone bold lines treated as sub-headings (e.g. **Key Points:**)
 *  - Unordered lists (- or • prefix)
 *  - Step N: lines styled as numbered headings
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

function isListLine(line: string): boolean {
  return /^[-•]\s/.test(line.trim());
}

function isBoldHeading(line: string): boolean {
  return /^\*\*[^*]+\*\*:?\s*$/.test(line.trim());
}

function isStepHeading(line: string): boolean {
  return /^Step\s+\d+:/i.test(line.trim());
}

export function renderMarkdown(text: string): string {
  if (!text) return '';

  const blocks = text.split(/\n{2,}/);
  const parts: string[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean);
    if (!lines.length) continue;

    // Pure list block
    if (lines.every(l => isListLine(l))) {
      const items = lines
        .map(l => `<li class="ml-5 list-disc">${applyInline(l.trim().slice(2))}</li>`)
        .join('');
      parts.push(`<ul class="space-y-1 my-3 text-gray-700 dark:text-gray-300">${items}</ul>`);
      continue;
    }

    // Mixed block — process line by line
    let listBuf: string[] = [];

    const flushList = () => {
      if (listBuf.length) {
        parts.push(
          `<ul class="space-y-1 my-3 text-gray-700 dark:text-gray-300">${listBuf.join('')}</ul>`
        );
        listBuf = [];
      }
    };

    for (const raw of lines) {
      const line = raw.trim();

      if (isListLine(line)) {
        listBuf.push(`<li class="ml-5 list-disc">${applyInline(line.slice(2))}</li>`);
        continue;
      }

      flushList();

      if (line.startsWith('# ')) {
        parts.push(
          `<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">${applyInline(line.slice(2))}</h2>`
        );
      } else if (line.startsWith('## ')) {
        parts.push(
          `<h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-5 mb-2">${applyInline(line.slice(3))}</h3>`
        );
      } else if (isBoldHeading(line)) {
        const inner = line.replace(/^\*\*([^*]+)\*\*:?\s*$/, '$1');
        parts.push(
          `<h4 class="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-1">${escapeHtml(inner)}</h4>`
        );
      } else if (isStepHeading(line)) {
        const [head, ...rest] = line.split(':');
        const tail = rest.join(':').trim();
        parts.push(
          `<p class="font-semibold text-cyan-700 dark:text-cyan-400 mt-4 mb-1">${escapeHtml(head)}${tail ? ': ' + applyInline(tail) : ''}</p>`
        );
      } else {
        parts.push(
          `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">${applyInline(line)}</p>`
        );
      }
    }

    flushList();
  }

  return parts.join('\n');
}
