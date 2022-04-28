import { PromoBanner } from '@seaccentral/core/dist/promo-banner/PromoBanner.entity';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { transformLanguage } from '@seaccentral/core/dist/utils/language';

export class PromoBannerResponseDto extends PromoBanner {
  @ApiProperty()
  @Transform(transformLanguage)
  header: Language;

  @ApiProperty()
  @Transform(transformLanguage)
  subtitle: Language;

  @ApiProperty()
  @Transform(transformLanguage)
  cta: Language;

  constructor(promoBanner: Partial<PromoBanner>) {
    super();
    Object.assign(this, promoBanner);
  }
}
