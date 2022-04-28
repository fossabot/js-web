import { ApiProperty } from '@nestjs/swagger';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserUpcomingBookingsResponse extends CourseSessionBooking {
  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  get startDateTime() {
    return this.courseSession.startDateTime;
  }

  @Expose()
  @ApiProperty()
  get endDateTime() {
    return this.courseSession.endDateTime;
  }

  constructor(csb: Partial<CourseSessionBooking>, langCode: LanguageCode) {
    super();
    Object.assign(this, csb);
    this.title = getStringFromLanguage(
      csb.courseSession?.courseOutline?.title,
      langCode,
    );
  }
}
