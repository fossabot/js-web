import * as Yup from 'yup';

import { User } from './user';
import { ICourseOutline } from './course';

export enum CourseRuleType {
  REQUIRED = 'required',
  BOOK = 'book',
  PRE_ASSESSMENT = 'pre-assessment',
}

export interface ICourseRuleItem {
  id?: string;
  type: CourseRuleType;
  appliedForId: string;
  appliedById: string;
  appliedFor?: ICourseOutline;
  appliedBy?: ICourseOutline;
  createdAt?: any;
}

export interface ICourseRule {
  id?: string;
  name: string;
  courseRuleItems: ICourseRuleItem[];
  createdById?: string;
  lastModifiedById?: string;
  createdBy?: User;
  lastModifiedBy?: User;
  createdAt?: any;
  isActive?: boolean;
}

export const courseRuleValidationSchema = Yup.object({
  name: Yup.string().trim().required('courseRuleCreatePage.required'),
  courseRuleItems: Yup.array()
    .of(
      Yup.object().shape({
        appliedById: Yup.string()
          .trim()
          .required('courseRuleCreatePage.required'),
        appliedForId: Yup.string()
          .trim()
          .required('courseRuleCreatePage.required'),
        type: Yup.string()
          .oneOf(Object.values(CourseRuleType))
          .required('courseRuleCreatePage.required'),
      }),
    )
    .min(1)
    .required('courseRuleCreatePage.required'),
});
