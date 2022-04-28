import cx, { Argument } from 'classnames';
import Link from 'next/link';
import { FC } from 'react';
import WEB_PATHS from '../constants/webPaths';
import useTranslation from '../i18n/useTranslation';
import Button from '../ui-kit/Button';
import { PencilOutline } from '../ui-kit/icons';

interface IEditProfileButton {
  className?: Argument | Argument[];
}

const EditProfileButton: FC<IEditProfileButton> = ({ className }) => {
  const { t } = useTranslation();

  return (
    <div
      className={cx(
        'flex-shrink-0 transform-gpu transition-all duration-500',
        className,
      )}
    >
      <Link href={WEB_PATHS.EDIT_PROFILE} passHref>
        <a tabIndex={-1}>
          <Button
            size="small"
            variant="secondary"
            className="text-black"
            iconLeft={<PencilOutline className="h-4 w-4 text-gray-650" />}
            iconWrapperClassName="pr-1"
            style={{ backgroundColor: 'white' }}
          >
            <p className="whitespace-nowrap text-caption font-semibold">
              {t('publicUserProfilePage.editProfileButton')}
            </p>
          </Button>
        </a>
      </Link>
    </div>
  );
};

export default EditProfileButton;
