import { ApiProperty } from '@nestjs/swagger';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetAllEmailNotificationResponseDto extends EmailNotification {
  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: string;

  @Expose()
  @ApiProperty()
  triggerText() {
    return this.triggerType.displayName;
  }

  @Expose()
  @ApiProperty()
  categoryName() {
    return this.category.parent.name;
  }

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  isActive: string;

  constructor(
    emailNotification: Partial<EmailNotification>,
    langCode: LanguageCode,
  ) {
    super();
    Object.assign(this, emailNotification);
    this.langCode = langCode;
  }
}
