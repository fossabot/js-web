import cx from 'classnames';
import { format } from 'date-fns';
import Link from 'next/link';
import React, { FC } from 'react';
import WEB_PATHS from '../constants/webPaths';
import { CourseSessionToBook } from '../hooks/useBookSession';
import { useLocaleText } from '../i18n/useLocaleText';
import useTranslation from '../i18n/useTranslation';
import {
  CourseSubCategoryKey,
  ICourseOutline,
  ICourseSessionInstructor,
} from '../models/course';
import { Language } from '../models/language';
import { ContentLineClamp } from '../ui-kit/ContentLineClamp/ContentLineClamp';
import { ArrowRight, FaceToFaceGray, VirtualGray } from '../ui-kit/icons';
import { ProfilePic } from '../ui-kit/ProfilePic';
import { getInstructorName } from './getInstructorName';

interface ICourseSessionBookingCard {
  outline: ICourseOutline<Language>;
  session: CourseSessionToBook | null;
  courseId?: string;
  className?: string;
}

const CourseSessionBookingCard: FC<ICourseSessionBookingCard> = ({
  session,
  outline,
  courseId,
  className,
}) => {
  const { t } = useTranslation();
  const localeText = useLocaleText();

  const instructor = (session?.instructors[0] ||
    null) as ICourseSessionInstructor | null;

  const startDate = session ? new Date(session.startDateTime) : new Date();
  const endDate = session ? new Date(session.endDateTime) : new Date();

  if (!session || !outline) return null;

  return (
    <div
      className={cx(
        'space-y-4 rounded-2xl border border-gray-200 bg-gray-100 p-4',
        className,
      )}
    >
      {!courseId && (
        <h6 className="truncate text-subheading font-bold">
          {String(outline.part).padStart(2, '0')} {localeText(outline?.title)}
        </h6>
      )}
      {localeText(outline.description).trim().length > 0 && (
        <ContentLineClamp
          collapsable={false}
          content={localeText(outline.description)}
          allowLines={3}
          lineHeight={21}
        />
      )}

      {courseId && (
        <Link href={WEB_PATHS.COURSE_DETAIL.replace(':id', courseId)} passHref>
          <a className="flex w-max items-center text-brand-primary">
            <p className="text-caption font-semibold">View Course Details</p>
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      )}

      <div className="flex flex-1 items-center space-x-2 truncate">
        <ProfilePic
          className="h-12 w-12 text-gray-300"
          imageKey={instructor?.profileImageKey}
        />
        <div className="truncate">
          <div className="truncate font-semibold">
            {getInstructorName(instructor, t)}
          </div>
          <div className="flex items-center">
            {outline.category.key === CourseSubCategoryKey.VIRTUAL ? (
              <VirtualGray className="mr-1 h-4 w-4" />
            ) : (
              <FaceToFaceGray className="mr-1 h-4 w-4" />
            )}

            <span className="text-footnote font-semibold text-gray-500">
              {outline.category.key === CourseSubCategoryKey.VIRTUAL &&
                `${t('courseDetailPage.virtual')} - ${session.webinarTool}`}
              {outline.category.key === CourseSubCategoryKey.FACE_TO_FACE &&
                t('courseDetailPage.faceToFace')}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <div className="flex flex-wrap items-center justify-between">
        <span className="text-subheading font-semibold">
          {format(startDate, 'iii')} -{' '}
          {format(startDate, 'dd MMM yy').toUpperCase()}
        </span>

        <span className="text-subheading font-semibold">
          {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default CourseSessionBookingCard;
