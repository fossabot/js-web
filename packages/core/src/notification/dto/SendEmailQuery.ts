import { SendMailOptions } from 'nodemailer';
import { LanguageCode } from '../../language/Language.entity';
import { EmailNotificationSubCategoryKey } from '../enum/EmailNotificationSubCategory.enum';

export interface SendEmailQuery {
  to: string | string[];
  key: EmailNotificationSubCategoryKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacements: Record<string, any>;
  language: LanguageCode;
  options?: SendMailOptions;
}
