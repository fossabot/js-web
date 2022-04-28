import { useState } from 'react';
import { EMAIL_FORMAT_PREVIEW } from '../../constants/localstorage';

export interface IEmailFormatPreview {
  formatName: string;
  teamName: string;
  headerImage: string;
  footerImage: string;
  footerHTML: string;
  copyrightText: string;
}

export function useEmailFormatPreviewPage() {
  const [formatPreview, setFormatPreview] = useState<
    Partial<IEmailFormatPreview>
  >({});

  function getValues() {
    const value = window.localStorage.getItem(EMAIL_FORMAT_PREVIEW);
    try {
      setFormatPreview(JSON.parse(value) || {});
    } catch (error) {
      console.error(error);
    }
  }

  return {
    getValues,
    formatPreview,
  };
}
