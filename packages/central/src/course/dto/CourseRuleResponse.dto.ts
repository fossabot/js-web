/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { CourseRule } from '@seaccentral/core/dist/course/CourseRule.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import {
  CourseRuleItem,
  CourseRuleType,
} from '@seaccentral/core/dist/course/CourseRuleItem.entity';

@Exclude()
class CourseRuleItemResponseDto extends CourseRuleItem {
  @Expose()
  @ApiProperty()
  get appliedForId() {
    return this.appliedFor.id;
  }

  @Expose()
  @ApiProperty()
  get appliedById() {
    return this.appliedBy.id;
  }

  @Expose()
  @ApiProperty()
  appliedFor: CourseOutline;

  @Expose()
  @ApiProperty()
  appliedBy: CourseOutline;

  @Expose()
  @ApiProperty()
  type: CourseRuleType;

  constructor(partial: Partial<CourseRuleItem>) {
    super();
    Object.assign(this, partial);
  }
}

export class CourseRuleResponseDto extends CourseRule {
  @Expose()
  @ApiProperty()
  get createdById() {
    return this.createdBy?.id;
  }

  @Expose()
  @ApiProperty()
  get lastModifiedById() {
    return this.lastModifiedBy?.id;
  }

  @Expose()
  @ApiProperty()
  get courseRuleItems() {
    return this.courseRuleItem.map((cri) => new CourseRuleItemResponseDto(cri));
  }

  @Exclude()
  courseRuleItem: CourseRuleItem[];

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  createdBy: User;

  @Expose()
  @ApiProperty()
  lastModifiedBy: User;

  constructor(partial: Partial<CourseRule>) {
    super();
    Object.assign(this, partial);
  }
}
