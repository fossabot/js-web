import * as Yup from 'yup';
import {
  CourseCategory,
  CourseCategoryKey,
  CourseStatus,
  ICourse,
} from './course';
import { Language } from './language';
import {
  UserAssignedLearningTrack,
  UserAssignedLearningTrackType,
} from './userAssignedLearningTrack';

export interface ISectionCourse<T extends Language | string = string>
  extends ICourse<T> {
  isRequired: boolean;
}

export interface ILearningTrackSection<T extends Language | string = string> {
  id?: string;
  title?: T | null;
  part: number;
  courses: Partial<ISectionCourse<T>>[];
  learningTrackId?: string;
  courseIds: string[];
  createdAt?: string;
}

export interface ILearningTrack<T extends Language | string = string> {
  id?: string;
  title: T;
  tagLine?: T | null;
  durationMinutes: number;
  durationHours: number;
  durationDays: number;
  durationWeeks: number;
  durationMonths: number;
  description?: T | null;
  learningObjective?: T | null;
  learningTrackTarget?: T | null;
  isPublic: boolean;
  isFeatured: boolean;
  status: CourseStatus | string;
  category?: CourseCategory<CourseCategoryKey>;
  categoryId: string;
  learningTrackSections: ILearningTrackSection<T>[];
  tagIds: string[];
  materialIds: string[];
  topicIds: string[];
  topics?: any[];
  tags?: any[];
  materials?: any[];
  createdAt?: any;
  imageFile: any;
  imageKey: string;
  hasCertificate?: boolean;
  userAssignedLearningTrack?: Pick<
    UserAssignedLearningTrack,
    'assignmentType'
  >[];
}

export interface ILearningTrackSectionDetail<
  T extends Language | string = string,
> extends ILearningTrackSection<T> {
  courses: Partial<ISectionCourse<T>>[];
}

export interface ILearningTrackDetail<T extends Language | string = string>
  extends ILearningTrack<T> {
  userEnrolledLearningTrack: { success: boolean }[];
  learningTrackSections: ILearningTrackSectionDetail<T>[];
  userEnrolledStatus: UserEnrolledLearningTrackStatus;
}

export enum UserEnrolledLearningTrackStatus {
  ENROLLED = 'enrolled',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface UserEnrolledLearningTrackRaw {
  id: string;
  title: string;
  tagLine: string;
  durationMonths: number;
  durationWeeks: number;
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
  lessonLength: number;
  averagePercentage: number;
  categoryKey: CourseCategoryKey;
  imageKey: string;
  isArchived: boolean;
  firstCourseOutlineId: string;
  hasCertificate: boolean;
  userAssignedLearningTrackType?: UserAssignedLearningTrackType;
  dueDateTime: string;
}

export const learningTrackValidationSchema = Yup.object({
  title: Yup.object()
    .nullable()
    .shape({
      nameEn: Yup.string().trim().required('required'),
      nameTh: Yup.string().trim().optional(),
    }),
  tagLine: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional(),
    nameTh: Yup.string().trim().optional(),
  }),
  description: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional().nullable(),
    nameTh: Yup.string().trim().optional().nullable(),
  }),
  learningObjective: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional().nullable(),
    nameTh: Yup.string().trim().optional().nullable(),
  }),
  learningTrackTarget: Yup.object().nullable().shape({
    nameEn: Yup.string().trim().optional().nullable(),
    nameTh: Yup.string().trim().optional().nullable(),
  }),
  isPublic: Yup.boolean().required('required'),
  isFeatured: Yup.boolean().required('required'),
  status: Yup.string().trim().required('required'),
  categoryId: Yup.string().trim().required('required'),
  imageFile: Yup.object().optional().nullable(),
  imageKey: Yup.string().optional().nullable(),
  learningTrackSections: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.object().shape({
          nameEn: Yup.string().trim().required('required'),
          nameTh: Yup.string().trim().optional().nullable(),
        }),
        part: Yup.number()
          .min(1, 'learningTrackCreatePage.partMin')
          .required('required'),
        courses: Yup.array()
          .of(
            Yup.object().shape({
              id: Yup.string().trim().required('required'),
            }),
          )
          .min(1)
          .required('required'),
      }),
    )
    .min(1)
    .required('required'),
  tagIds: Yup.array().of(Yup.string()).optional(),
  materialIds: Yup.array().of(Yup.string()).optional(),
  topicIds: Yup.array()
    .of(Yup.string())
    .min(1, 'required')
    .required('required'),
});
