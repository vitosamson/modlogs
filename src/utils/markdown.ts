import marked, { Renderer } from 'marked';
import domPurify from 'dompurify';

/**
 * By default, `marked` renders inline code as <pre><code>{code}</code></pre>, but this causes overflow
 * issues with no way to force a word-break on long lines (e.g. a long URL inside a code block).
 * Instead, render the code just inside a <code> tag, which does break as expected.
 */
const renderer = new Renderer();
renderer.code = (code, infostring, escaped) => {
  return `<p><code>${code}</code></p>`;
};

marked.setOptions({
  gfm: true,
  renderer,
});

// TODO: find a different html sanitizer that doesn't rely on jsdom for SSR
let sanitize = domPurify.sanitize;
if (typeof window === 'undefined') {
  import('jsdom').then(jsdom => {
    const window = (new jsdom.JSDOM('').window as unknown) as globalThis.Window;
    sanitize = domPurify(window).sanitize;
  });
}

export function mdToHtml(markdown: string) {
  return sanitize(marked(markdown));
}

type Cell = string | number;
type Row = Cell[];

export function createMarkdownTable(columnHeaders: Row, rows: Row[]): string {
  const headerRow = `| ${columnHeaders.join(' | ')} |`;
  const separatorRow = `${'|---'.repeat(columnHeaders.length)}|`;

  return `${headerRow}
${separatorRow}
${rows.map(row => `| ${row.join(' | ')} |`).join('\n')}`;
}
