import * as marked from 'marked';

marked.setOptions({
  gfm: true,
  sanitize: true,
});

export default function mdToHtml(markdown: string) {
  return marked(markdown);
}
