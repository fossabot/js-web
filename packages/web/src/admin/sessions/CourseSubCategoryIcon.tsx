import cx from 'classnames';
import { CourseSubCategoryKey } from '../../models/course';
import {
  FaceToFace,
  FaceToFaceGray,
  Virtual,
  VirtualGray,
} from '../../ui-kit/icons';

function CourseSubCategoryIcon({
  category,
  className,
  enabledHoverState = false,
  isHover = false,
}: {
  category: CourseSubCategoryKey;
  className?: string;
  enabledHoverState?: boolean;
  isHover?: boolean;
}) {
  let icon: React.ReactNode;
  let iconHover: React.ReactNode;

  if (category === CourseSubCategoryKey.VIRTUAL) {
    icon = <VirtualGray />;
    iconHover = <Virtual />;
  } else {
    icon = <FaceToFaceGray />;
    iconHover = <FaceToFace />;
  }

  if (enabledHoverState) {
    return (
      <div className={cx('relative block h-4 w-4', className)}>
        <div
          className={cx('absolute z-0 h-full w-full', {
            'opacity-100': !isHover,
            'opacity-0': isHover,
          })}
        >
          {icon}
        </div>
        <div
          className={cx('absolute z-10 h-full w-full', {
            'opacity-0': !isHover,
            'opacity-100': isHover,
          })}
        >
          {iconHover}
        </div>
      </div>
    );
  } else {
    return (
      <div className={cx('block h-4 w-4', className)}>
        <div className="h-full w-full">{iconHover}</div>
      </div>
    );
  }
}

export default CourseSubCategoryIcon;
