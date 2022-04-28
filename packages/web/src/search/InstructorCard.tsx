import pluralize from 'pluralize';
import { useRouter } from 'next/router';

import WEB_PATHS from '../constants/webPaths';
import { PlayCircleGray } from '../ui-kit/icons';
import { ProfilePic } from '../ui-kit/ProfilePic';
import useTranslation from '../i18n/useTranslation';

export interface IInstructorCardProps {
  imageKey: string;
  id: string;
  firstName: string;
  lastName: string;
  totalCourses: number;
}

export default function InstructorCard(props: IInstructorCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div
      onClick={() =>
        router.push(WEB_PATHS.USER_PROFILE.replace(':id', props.id))
      }
      className="flex w-full cursor-pointer flex-row items-center justify-start rounded-lg border border-gray-300 px-3 py-4 lg:w-348px lg:px-6 lg:py-6"
    >
      <div className="h-20 w-22">
        <ProfilePic
          imageKey={props.imageKey}
          className="h-full w-full text-gray-500"
        />
      </div>
      <div className="ml-4 flex flex-1 flex-col justify-start lg:ml-6">
        <span className="text-subheading font-semibold text-black line-clamp-1">
          {props.firstName
            ? `${props.firstName} ${props.lastName}`.trim()
            : 'Unspecified'}
        </span>
        <div className="flex flex-row items-center justify-start">
          <PlayCircleGray className="h-4 w-4 text-gray-500" />
          <span className="ml-1 text-footnote font-semibold text-gray-600">
            {props.totalCourses || 0}{' '}
            {pluralize(t('searchResultPage.course'), props.totalCourses || 1)}
          </span>
        </div>
      </div>
    </div>
  );
}
