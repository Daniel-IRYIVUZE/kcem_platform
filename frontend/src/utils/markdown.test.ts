/**
 * tests/utils/markdown.test.ts
 * Unit tests for the lightweight Markdown → HTML converter used in blog posts.
 */
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('renderMarkdown — edge cases', () => {
  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });

  it('returns empty string for undefined/falsy input', () => {
    // The function guards with `if (!text) return ''`
    expect(renderMarkdown(undefined as unknown as string)).toBe('');
    expect(renderMarkdown(null as unknown as string)).toBe('');
  });

  it('ignores blank-only input', () => {
    expect(renderMarkdown('   \n\n   ')).toBe('');
  });
});

// ── XSS / escaping ────────────────────────────────────────────────────────────

describe('renderMarkdown — HTML escaping', () => {
  it('escapes < and > characters', () => {
    const out = renderMarkdown('Hello <script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('escapes & characters', () => {
    const out = renderMarkdown('Cats & Dogs');
    expect(out).toContain('&amp;');
  });

  it('escapes double-quote characters', () => {
    const out = renderMarkdown('He said "hello"');
    expect(out).toContain('&quot;');
  });
});

// ── Headings ──────────────────────────────────────────────────────────────────

describe('renderMarkdown — headings', () => {
  it('renders # as <h2>', () => {
    const out = renderMarkdown('# Main Title');
    expect(out).toContain('<h2');
    expect(out).toContain('Main Title');
  });

  it('renders ## as <h3>', () => {
    const out = renderMarkdown('## Sub Title');
    expect(out).toContain('<h3');
    expect(out).toContain('Sub Title');
  });

  it('does not promote ### to a heading element', () => {
    const out = renderMarkdown('### Not a heading');
    expect(out).not.toContain('<h2');
    expect(out).not.toContain('<h3');
  });
});

// ── Inline formatting ─────────────────────────────────────────────────────────

describe('renderMarkdown — inline formatting', () => {
  it('wraps **text** in <strong>', () => {
    const out = renderMarkdown('This is **bold** text.');
    expect(out).toContain('<strong>bold</strong>');
  });

  it('wraps *text* in <em>', () => {
    const out = renderMarkdown('This is *italic* text.');
    expect(out).toContain('<em>italic</em>');
  });

  it('handles both bold and italic in the same line', () => {
    const out = renderMarkdown('**Bold** and *italic*.');
    expect(out).toContain('<strong>Bold</strong>');
    expect(out).toContain('<em>italic</em>');
  });
});

// ── Lists ─────────────────────────────────────────────────────────────────────

describe('renderMarkdown — unordered lists', () => {
  it('renders "- item" lines as <ul><li>', () => {
    const out = renderMarkdown('- Item one\n- Item two');
    expect(out).toContain('<ul');
    expect(out).toContain('<li');
    expect(out).toContain('Item one');
    expect(out).toContain('Item two');
  });

  it('renders "• item" bullet lines as list items', () => {
    const out = renderMarkdown('• First\n• Second');
    expect(out).toContain('<li');
    expect(out).toContain('First');
  });

  it('closes <ul> after the list block', () => {
    const out = renderMarkdown('- A\n- B');
    expect(out).toContain('</ul>');
  });
});

// ── Bold headings ─────────────────────────────────────────────────────────────

describe('renderMarkdown — bold standalone headings', () => {
  it('renders a standalone **Heading:** line as <h4>', () => {
    const out = renderMarkdown('**Key Points:**');
    expect(out).toContain('<h4');
    expect(out).toContain('Key Points');
  });

  it('renders **Heading** (no colon) as <h4>', () => {
    const out = renderMarkdown('**Summary**');
    expect(out).toContain('<h4');
    expect(out).toContain('Summary');
  });
});

// ── Step headings ─────────────────────────────────────────────────────────────

describe('renderMarkdown — step headings', () => {
  it('renders "Step 1: description" as a styled paragraph', () => {
    const out = renderMarkdown('Step 1: Register your account');
    expect(out).toContain('Step 1');
    expect(out).toContain('Register your account');
  });

  it('renders "step 2: …" (lowercase) as a step heading', () => {
    const out = renderMarkdown('step 2: Verify your email');
    expect(out).toContain('step 2');
  });
});

// ── Paragraphs ────────────────────────────────────────────────────────────────

describe('renderMarkdown — paragraphs', () => {
  it('wraps plain text in <p>', () => {
    const out = renderMarkdown('Just a plain sentence.');
    expect(out).toContain('<p');
    expect(out).toContain('Just a plain sentence.');
  });

  it('separates blank-line blocks into multiple <p> elements', () => {
    const out = renderMarkdown('First paragraph.\n\nSecond paragraph.');
    const count = (out.match(/<p /g) || []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

// ── Mixed content ─────────────────────────────────────────────────────────────

describe('renderMarkdown — mixed content', () => {
  it('handles heading + paragraph + list in one document', () => {
    const md = `# Getting Started\n\nWelcome to EcoTrade.\n\n- Register\n- List waste\n- Bid`;
    const out = renderMarkdown(md);
    expect(out).toContain('<h2');
    expect(out).toContain('Welcome to EcoTrade');
    expect(out).toContain('<ul');
    expect(out).toContain('<li');
  });

  it('handles inline bold inside a list item', () => {
    const out = renderMarkdown('- **Important** step');
    expect(out).toContain('<strong>Important</strong>');
  });
});
