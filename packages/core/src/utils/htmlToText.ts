import { convert, HtmlToTextOptions } from 'html-to-text';

export function htmlToText(html: string) {
  const options: HtmlToTextOptions = {
    selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((header) => ({
      selector: header,
      options: { uppercase: false },
    })),
  };
  return convert(html, options);
}
