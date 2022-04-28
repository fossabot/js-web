import { Base } from './base';
import { Language } from './language';

export interface PromoBanner extends Base {
  header: Language | null;

  subtitle: Language | null;

  cta: Language | null;

  assetKey: string;

  overlayColor?: string | null;

  textColor: string;

  href: string;

  sequence: number;
}
