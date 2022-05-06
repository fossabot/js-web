import { LanguageCode } from '../../../language/Language.entity';
import { SendEmailQuery } from '../../../notification/dto/SendEmailQuery';
import { EmailNotificationSubCategoryKey } from '../../../notification/enum/EmailNotificationSubCategory.enum';

export const minimalEmailQuery: SendEmailQuery = {
  to: 'seac.john@yopmail.com',
  key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
  replacements: {},
  language: LanguageCode.EN,
};
