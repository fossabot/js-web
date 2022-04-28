import { get } from 'lodash';
import { FC, useState } from 'react';
import useTranslation from '../i18n/useTranslation';
import {
  CourseCategoryKey,
  CourseSubCategoryKey,
  ICourseDetail,
} from '../models/course';
import {
  BurgerMenu,
  FaceToFace,
  FaceToFaceGray,
  Virtual,
  VirtualGray,
} from '../ui-kit/icons';
import {
  IEnrolledStatus,
  ValidateCourseOutlineParams,
} from './CourseDetailPage';
import CourseOutlineItem from './CourseOutlineItem';
import { CourseOutlineTab } from './CourseOutlineTab';
import { CourseOutlineTabItem } from './CourseOutlineTabItem';
import { ProgressLine } from './ProgressLine';

export interface ICourseOutline {
  courseDetail: ICourseDetail;
  enrolledStatus: IEnrolledStatus;
  onValidateCourseOutline: (
    params: ValidateCourseOutlineParams,
  ) => Promise<boolean>;
}

export const CourseOutline: FC<ICourseOutline> = (props) => {
  const { courseDetail, enrolledStatus, onValidateCourseOutline } = props;
  const { t } = useTranslation();

  const header = (
    <h3 className="mt-4 mb-6 flex items-center text-heading font-semibold text-black">
      <BurgerMenu className="mr-2 inline h-6 w-6" />
      {t('courseDetailPage.outline')}
    </h3>
  );

  const virtualCategory = courseDetail.courseOutlines.filter(
    (courseOutline) =>
      courseOutline.category.key === CourseSubCategoryKey.VIRTUAL,
  );
  const f2fCategory = courseDetail.courseOutlines.filter(
    (courseOutline) =>
      courseOutline.category.key === CourseSubCategoryKey.FACE_TO_FACE,
  );

  const [tabKey, setTabKey] = useState<CourseSubCategoryKey>(
    virtualCategory.length > 0
      ? CourseSubCategoryKey.VIRTUAL
      : CourseSubCategoryKey.FACE_TO_FACE,
  );

  if (courseDetail.category.key === CourseCategoryKey.LEARNING_EVENT) {
    return (
      <>
        {header}
        <CourseOutlineTab
          onTabClick={(key: CourseSubCategoryKey) => setTabKey(key)}
          defaultActiveKey={tabKey}
        >
          {virtualCategory.length > 0 && (
            <CourseOutlineTabItem
              tabKey={CourseSubCategoryKey.VIRTUAL}
              activeIcon={<Virtual className="mr-2" />}
              inactiveIcon={<VirtualGray className="mr-2" />}
            >
              <span>{t('courseDetailPage.virtual')}</span>
            </CourseOutlineTabItem>
          )}
          {f2fCategory.length > 0 && (
            <CourseOutlineTabItem
              tabKey={CourseSubCategoryKey.FACE_TO_FACE}
              activeIcon={<FaceToFace className="mr-2" />}
              inactiveIcon={<FaceToFaceGray className="mr-2" />}
            >
              <span>{t('courseDetailPage.faceToFace')}</span>
            </CourseOutlineTabItem>
          )}
        </CourseOutlineTab>
        <div className="my-3" />
        {tabKey === CourseSubCategoryKey.VIRTUAL &&
          virtualCategory.map((outline, index) => (
            <div key={outline.id} className="lg:flex lg:space-x-4 lg:px-6">
              <div className="hidden lg:block">
                <div className="pt-7" />
                <ProgressLine
                  percentage={get(
                    outline.userCourseOutlineProgress[0],
                    'percentage',
                    0,
                  )}
                  path={
                    virtualCategory.length > 1 &&
                    index < virtualCategory.length - 1
                  }
                />
              </div>
              <CourseOutlineItem
                outline={outline}
                index={index}
                courseDetail={courseDetail}
                enrolledStatus={enrolledStatus}
                onValidate={onValidateCourseOutline}
              />
            </div>
          ))}
        {tabKey === CourseSubCategoryKey.FACE_TO_FACE &&
          f2fCategory.map((outline, index) => (
            <div key={outline.id} className="lg:flex lg:space-x-4 lg:px-6">
              <div className="hidden lg:block">
                <div className="pt-7" />
                <ProgressLine
                  percentage={get(
                    outline.userCourseOutlineProgress[0],
                    'percentage',
                    0,
                  )}
                  path={
                    f2fCategory.length > 1 && index < f2fCategory.length - 1
                  }
                />
              </div>
              <CourseOutlineItem
                key={outline.id}
                outline={outline}
                index={index}
                courseDetail={courseDetail}
                enrolledStatus={enrolledStatus}
                onValidate={onValidateCourseOutline}
              />
            </div>
          ))}
      </>
    );
  }

  return (
    <>
      {header}
      {courseDetail.courseOutlines.map((outline, index) => (
        <CourseOutlineItem
          key={outline.id}
          outline={outline}
          index={index}
          courseDetail={courseDetail}
          enrolledStatus={enrolledStatus}
          onValidate={onValidateCourseOutline}
        />
      ))}
    </>
  );
};
