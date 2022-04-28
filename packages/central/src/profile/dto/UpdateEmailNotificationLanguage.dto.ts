import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailNotificationLanguage {
  @IsString()
  @IsNotEmpty()
  emailNotificationLanguage: LanguageCode;
}
