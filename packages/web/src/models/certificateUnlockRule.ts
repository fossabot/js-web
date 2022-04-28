import * as Yup from 'yup';

import { User } from './user';
import { ICourse } from './course';
import { Language } from './language';
import { ILearningTrack } from './learningTrack';
import { CertificationType, ICertificate } from './certificate';

export interface ICertificateUnlockRuleCourseItem {
  id?: string;
  courseId: string;
  course?: ICourse<Language>;
  percentage: number;
}

export interface ICertificateUnlockRuleLearningTrackItem {
  id?: string;
  learningTrackId: string;
  learningTrack?: ILearningTrack<Language>;
}

export interface ICertificateUnlockRule {
  id?: string;
  createdById?: string;
  lastModifiedById?: string;
  createdBy?: User;
  lastModifiedBy?: User;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  ruleName: string;
  certificateId: string;
  certificate?: ICertificate;
  unlockType: CertificationType;
  unlockCourseRuleItems?: ICertificateUnlockRuleCourseItem[];
  unlockLearningTrackRuleItems?: ICertificateUnlockRuleLearningTrackItem[];
}

export const certificateUnlockRuleValidationSchema = Yup.object({
  ruleName: Yup.string().trim().required('required'),
  certificateId: Yup.string().trim().required('required'),
  unlockType: Yup.string()
    .oneOf([CertificationType.COURSE, CertificationType.LEARNING_TRACK])
    .required('required'),
  unlockCourseRuleItems: Yup.array().when('unlockType', {
    is: CertificationType.COURSE,
    then: Yup.array()
      .of(
        Yup.object().shape({
          percentage: Yup.number().required('required'),
          courseId: Yup.string().trim().required('required'),
        }),
      )
      .min(1, 'required')
      .required('required'),
    otherwise: Yup.array()
      .of(
        Yup.object().shape({
          percentage: Yup.number().required('required'),
          courseId: Yup.string().trim().required('required'),
        }),
      )
      .min(0)
      .optional(),
  }),
  unlockLearningTrackRuleItems: Yup.array().when('unlockType', {
    is: CertificationType.LEARNING_TRACK,
    then: Yup.array()
      .of(
        Yup.object().shape({
          learningTrackId: Yup.string().trim().required('required'),
        }),
      )
      .min(1, 'required')
      .required('required'),
    otherwise: Yup.array()
      .of(
        Yup.object().shape({
          learningTrackId: Yup.string().trim().required('required'),
        }),
      )
      .min(0)
      .optional(),
  }),
});
