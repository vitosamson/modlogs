import { createMarkdownTable } from './markdown';

describe('createMarkdownTable', () => {
  it('properly constructs a reddit markdown table', () => {
    const headerRow = ['foo', 'bar', 'baz'];
    const bodyRows = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ];

    const table = createMarkdownTable(headerRow, bodyRows);
    expect(table.trim()).toEqual(
      `| foo | bar | baz |
|---|---|---|
| a | b | c |
| d | e | f |`.trim()
    );
  });
});
