import { CourseType } from '@seaccentral/core/dist/course/courseType.enum';

export class IListFilter {
  [x: string]: any;

  isActive: boolean;

  courseType?: CourseType;
}
