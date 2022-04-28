import {
  CourseDiscovery,
  CourseDiscoveryType,
} from '@seaccentral/core/dist/course-discovery/CourseDiscovery.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { Exclude, Expose } from 'class-transformer';
import { CourseSearchResponseDto } from '../../course/dto/CourseSearchResponse.dto';

interface ISortable {
  sequence: number;
}

function sortBySequence(a: ISortable, b: ISortable) {
  if (a.sequence > b.sequence) {
    return 1;
  }
  if (a.sequence < b.sequence) {
    return -1;
  }
  return 0;
}

@Exclude()
export class GetCourseDiscoveryDto {
  private courseDiscoveries: CourseDiscovery[];

  private acceptLanguage: LanguageCode;

  @Expose()
  get highlights() {
    return this.courseDiscoveries
      .filter((cd) => cd.type === CourseDiscoveryType.HIGHLIGHT)
      .sort(sortBySequence)
      .map((cd) => new CourseSearchResponseDto(cd.course, this.acceptLanguage));
  }

  @Expose()
  get popular() {
    return this.courseDiscoveries
      .filter((cd) => cd.type === CourseDiscoveryType.POPULAR)
      .sort(sortBySequence)
      .map((cd) => new CourseSearchResponseDto(cd.course, this.acceptLanguage));
  }

  @Expose()
  get newReleases() {
    return this.courseDiscoveries
      .filter((cd) => cd.type === CourseDiscoveryType.NEW_RELEASE)
      .sort(sortBySequence)
      .map((cd) => new CourseSearchResponseDto(cd.course, this.acceptLanguage));
  }

  constructor(cd: CourseDiscovery[], acceptLanguage: LanguageCode) {
    this.courseDiscoveries = cd;
    this.acceptLanguage = acceptLanguage;
  }
}
