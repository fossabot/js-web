export const isMarkdownEmpty = (markdown: string | null | undefined) => {
  return markdown
    ? !markdown
        .replaceAll(/<[^>]*>/g, ' ')
        .replaceAll(/\s{2,}/g, ' ')
        .trim()
    : true;
};
