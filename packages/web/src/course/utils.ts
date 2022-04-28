import { FormikProps } from 'formik';

import {
  CourseLanguage,
  CourseSubCategoryKey,
  getCourseOutlineInitialObj,
  ICourse,
  ICourseOutline,
  ICourseSession,
} from '../models/course';
import { Language } from '../models/language';

export const getCourseOutlineNamePrefix = (index: number) =>
  `courseOutlines[${index}]`;

export const getCourseSessionInitialData = (): Partial<ICourseSession> => ({
  seats: 1,
  webinarTool: '',
  location: '',
  participantUrl: '',
  startDateTime: new Date().toISOString(),
  endDateTime: new Date().toISOString(),
  instructorsIds: [],
  isDraft: true,
  language: CourseLanguage.EN,
  isPrivate: false,
});

export const setCourseOutlineForm = (
  formik: FormikProps<ICourse<Language>>,
  index: number,
  courseOutline: ICourseOutline<Language>,
  subCategoryKey?: string,
) => {
  const initialState = getCourseOutlineInitialObj();

  const courseOutlineNamePrefix = getCourseOutlineNamePrefix(index);

  formik.setFieldValue(
    `${courseOutlineNamePrefix}.outlineType`,
    subCategoryKey,
  );

  // map out all fields special to each subcategory

  const linkFields = [
    'organizationId',
    'providerName',
    'thirdPartyPlatformUrl',
    'thirdPartyCourseCode',
  ];

  const scormFields = ['learningContentFileKey', 'learningContentFiles'];

  const learningEventFields = ['courseSessions'];

  const videoFields = ['mediaPlaylist'];

  const assessmentFields = [
    'assessmentAPIEndpoint',
    'assessmentName',
    'assessmentNotifyEmailStatus',
    'assessmentUserCanRetest',
  ];

  const allFields = linkFields
    .concat(scormFields)
    .concat(learningEventFields)
    .concat(videoFields)
    .concat(assessmentFields);

  // fields that will have some special initialization
  const fieldsToSet =
    subCategoryKey === CourseSubCategoryKey.LINK
      ? linkFields
      : subCategoryKey === CourseSubCategoryKey.SCORM
      ? scormFields
      : subCategoryKey === CourseSubCategoryKey.FACE_TO_FACE ||
        subCategoryKey === CourseSubCategoryKey.VIRTUAL
      ? learningEventFields
      : subCategoryKey === CourseSubCategoryKey.VIDEO
      ? videoFields
      : subCategoryKey === CourseSubCategoryKey.ASSESSMENT
      ? assessmentFields
      : [];

  const fieldsToReset = allFields.filter(
    (field) => !fieldsToSet.includes(field),
  );

  for (const field of fieldsToReset) {
    formik.setFieldValue(
      `${courseOutlineNamePrefix}.${field}`,
      initialState[field],
    );
  }

  for (const field of fieldsToSet) {
    if (
      field === 'courseSessions' &&
      (!courseOutline || courseOutline.courseSessions.length === 0)
    ) {
      formik.setFieldValue(`${courseOutlineNamePrefix}.courseSessions`, [
        getCourseSessionInitialData(),
      ]);
    }

    if (field === 'mediaPlaylist') {
      const initialMedia =
        courseOutline?.courseOutlineMediaPlayList?.map((co) => co.media) || [];
      formik.setFieldValue(
        `${courseOutlineNamePrefix}.mediaPlaylist`,
        initialMedia,
      );
    }
  }
};
