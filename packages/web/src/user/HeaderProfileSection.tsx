import { FC, RefObject } from 'react';
import { useAuthInfo } from '../app-state/useAuthInfo';
import useTranslation from '../i18n/useTranslation';
import { User } from '../models/user';
import { ProfilePic } from '../ui-kit/ProfilePic';
import EditProfileButton from './EditProfileButton';

interface IHeaderProfileSection {
  user: User;
  refProp?: RefObject<HTMLDivElement>;
}

const HeaderProfileSection: FC<IHeaderProfileSection> = ({ user, refProp }) => {
  const { context } = useAuthInfo();
  const { t } = useTranslation();

  const isOwner = context.token.user.id === user.id;

  return (
    <div
      className="flex w-full items-center justify-center bg-gray-100 py-6"
      ref={refProp}
    >
      <div className="flex w-full max-w-screen-lg flex-row px-6">
        <div className="flex w-full flex-col lg:w-10/12 lg:flex-row lg:space-x-10">
          <div className="flex flex-row justify-between">
            <ProfilePic
              className="h-24.5 w-24.5 overflow-visible text-gray-300"
              imageKey={user.profileImageKey}
            />
            {isOwner && <EditProfileButton className="lg:hidden" />}
          </div>
          <div className="mt-4 flex flex-col justify-center lg:mt-0">
            <div className="flex flex-row items-center space-x-4">
              <p className="text-heading font-bold text-black lg:text-subtitle">{`${user.firstName} ${user.lastName}`}</p>
              <p className="rounded-xl border border-gray-500 py-1px px-2.5 text-footnote font-semibold text-gray-500 lg:text-caption">
                {/* May update this to Dynamic role name */}
                {t('publicUserProfilePage.instructor')}
              </p>
            </div>
            <p className="text-caption font-regular text-gray-650 lg:text-body">
              {user.shortSummary}
            </p>
          </div>
        </div>
        {isOwner && <EditProfileButton className="hidden lg:block" />}
      </div>
    </div>
  );
};

export default HeaderProfileSection;
