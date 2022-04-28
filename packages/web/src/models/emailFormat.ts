import { Base } from './base';

export interface EmailFormat extends Base {
  formatName: string;

  teamName: string;

  headerImageKey?: string | null;

  footerImageKey?: string | null;

  footerText?: string | null;

  footerHTML?: string | null;

  copyrightText?: string | null;

  isDefault: boolean;
}
