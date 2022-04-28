import { useRouter } from 'next/router';
import cx from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import { useAuthInfo } from '../app-state/useAuthInfo';
import { useScrolling } from '../hooks/useScrolling';
import useTranslation from '../i18n/useTranslation';
import { User } from '../models/user';
import { ProfilePic } from '../ui-kit/ProfilePic';
import EditProfileButton from './EditProfileButton';

export enum Section {
  ABOUT = 'about',
  UPCOMING = 'upcoming',
}

interface ISectionCard {
  section: Section;
  targetSection: Section;
  sectionName: string;
  className?: string;
}

const SectionCard: FC<ISectionCard> = ({
  section,
  sectionName,
  targetSection,
  className,
}) => {
  const router = useRouter();
  const switchSection = (section: Section) => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, section },
      },
      undefined,
      { shallow: true, scroll: true },
    );
  };

  return (
    <a
      className={cx(
        'relative flex cursor-pointer flex-row items-center justify-center py-4 hover:text-brand-primary',
        className,
        { 'text-brand-primary': section === targetSection },
      )}
      onClick={() => switchSection(targetSection)}
    >
      <p className="text-center">{sectionName}</p>
      <div
        className={cx('absolute bottom-0 w-full', {
          'border-b-2 border-brand-primary': section === targetSection,
        })}
      />
    </a>
  );
};

const ProfileInfoCard: FC<{ showProfile: boolean; user: User }> = ({
  showProfile,
  user,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cx(
        'hidden transform-gpu flex-row items-center space-x-4 transition-all duration-500 ease-in-out lg:flex',
        {
          'invisible max-w-0 opacity-0': !showProfile,
          'visible mr-8 max-w-xl opacity-100': showProfile,
        },
      )}
    >
      <ProfilePic
        className={'h-8 w-8 overflow-visible text-gray-300'}
        imageKey={user.profileImageKey}
      />
      <div className="flex flex-col justify-center">
        <div className="flex flex-row items-center space-x-4">
          <p className="whitespace-nowrap text-body font-bold text-black">{`${user.firstName} ${user.lastName}`}</p>
          <p className="rounded-xl border border-gray-500 py-1px px-2.5 text-caption font-semibold text-gray-500">
            {t('publicUserProfilePage.instructor')}
          </p>
        </div>
      </div>
    </div>
  );
};

interface IProfileSectionSelector {
  showProfile?: boolean;
  user: User;
}

const ProfileSectionSelector: FC<IProfileSectionSelector> = ({
  showProfile = false,
  user,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement | null>(null);
  const { isUp, isDown } = useScrolling();
  const { context } = useAuthInfo();
  const [hidden, setHidden] = useState(false);

  const section = Object.values<string>(Section).includes(
    router.query.section as string,
  )
    ? (router.query.section as Section)
    : Section.ABOUT;
  const isOwner = context.token.user.id === user.id;

  const shouldHideSelector = () => {
    if (ref.current)
      if (ref.current.getBoundingClientRect().y > 64)
        // 64px === Navbar height
        setHidden(false);
      else setHidden(true);
  };

  useEffect(() => {
    window.addEventListener('scroll', shouldHideSelector, { passive: true });

    return () => window.removeEventListener('scroll', shouldHideSelector);
  }, [shouldHideSelector]);

  return (
    <div
      className={cx(
        'flex w-full flex-row text-body font-semibold text-gray-500',
        'top-16 justify-center border-t border-b border-gray-200 bg-white',
        'z-20 transform-gpu transition-all duration-300 ease-in-out lg:sticky',
        {
          'invisible opacity-0 lg:visible lg:opacity-100': isDown && hidden,
          'visible opacity-100': isUp,
          sticky: section !== Section.UPCOMING,
        },
      )}
      ref={ref}
    >
      <div className="flex w-full max-w-screen-lg flex-row items-center justify-between overflow-hidden px-6">
        <div className="flex w-full flex-row">
          <ProfileInfoCard showProfile={showProfile} user={user} />
          <SectionCard
            section={section}
            targetSection={Section.ABOUT}
            sectionName={t('publicUserProfilePage.about')}
            className="mr-8"
          />
          <SectionCard
            section={section}
            targetSection={Section.UPCOMING}
            sectionName={t('publicUserProfilePage.upcoming')}
          />
        </div>
        <EditProfileButton
          className={[
            {
              'invisible opacity-0': !showProfile || !isOwner,
              'visible opacity-100': showProfile && isOwner,
            },
            'hidden lg:flex',
          ]}
        />
      </div>
    </div>
  );
};

export default ProfileSectionSelector;
