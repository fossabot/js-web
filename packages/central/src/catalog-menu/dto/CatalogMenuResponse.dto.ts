/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { CatalogMenu } from '@seaccentral/core/dist/catalog-menu/CatalogMenu.entity';
import { CatalogMenuLearningWay } from '@seaccentral/core/dist/catalog-menu/CatalogMenuLearningWay.entity';
import { CatalogMenuTopic } from '@seaccentral/core/dist/catalog-menu/CatalogMenuTopic.entity';
import { LanguageDto } from '@seaccentral/core/dist/language/Language.dto';
import { transformLanguage } from '@seaccentral/core/dist/utils/language';
import { Exclude, Expose, Transform } from 'class-transformer';

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

class CatalogMenuTopicResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}

function transformedMenuTopics({
  value,
}: {
  value: CatalogMenuTopic[];
}): CatalogMenuTopicResponseDto[] {
  return value && value.length
    ? value
        .filter((it) => it.topic)
        .sort(sortBySequence)
        .map((it) => ({
          id: it.topic.id,
          name: it.topic.name,
        }))
    : [];
}

export class CatalogMenuLearningWayResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  key?: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: 'string', nullable: true })
  description: string | null;
}

function transformMenuLearningWays({
  value,
}: {
  value: CatalogMenuLearningWay[];
}): CatalogMenuLearningWayResponseDto[] {
  return value && value.length
    ? value
        .filter((it) => it.learningWay)
        .sort(sortBySequence)
        .map((it) => ({
          id: it.learningWay.id,
          key: it.learningWay.key,
          name: it.learningWay.name,
          description: it.learningWay.description,
        }))
    : [];
}

@Exclude()
export class CatalogMenuResponse extends CatalogMenu {
  @Expose()
  id: string;

  @Expose()
  @Transform(transformLanguage)
  @ApiProperty({ type: LanguageDto })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  topicHeadline: LanguageDto;

  @Expose()
  @Transform(transformLanguage)
  @ApiProperty({ type: LanguageDto })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningWayHeadline: LanguageDto;

  @Expose()
  @Transform(transformedMenuTopics)
  @ApiProperty({ type: [CatalogMenuTopicResponseDto] })
  topics: Partial<CatalogMenuTopic>[];

  @Expose()
  @Transform(transformMenuLearningWays)
  @ApiProperty({ type: [CatalogMenuLearningWayResponseDto] })
  learningWays: Partial<CatalogMenuLearningWay>[];

  constructor(menu: Partial<CatalogMenu>) {
    super();
    Object.assign(this, menu);
  }
}
