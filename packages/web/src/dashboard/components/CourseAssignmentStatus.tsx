import useTranslation from '../../i18n/useTranslation';
import { UserAssignedCourseType } from '../../models/userAssignedCourse';
import cx from 'classnames';
import { Flag, Thumb } from '../../ui-kit/icons';

interface ICourseAssignmentStatusProps {
  type: UserAssignedCourseType;
}

export const CourseAssignmentStatus = ({
  type,
}: ICourseAssignmentStatusProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cx(
        'flex items-center space-x-1.5 rounded-2xl py-0.5 px-3 text-caption text-white',
        {
          'bg-orange-300': type === UserAssignedCourseType.Optional,
          'bg-brand-primary': type === UserAssignedCourseType.Required,
        },
      )}
    >
      {type === UserAssignedCourseType.Optional && <Thumb />}
      {type === UserAssignedCourseType.Required && <Flag />}

      <span>
        {t(
          `courseItem.${
            type === UserAssignedCourseType.Optional ? 'assigned' : 'required'
          }`,
        )}
      </span>
    </div>
  );
};
