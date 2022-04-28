import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Error from 'next/error';
import API_PATHS from '../constants/apiPaths';
import { useIsInViewport } from '../hooks/useIsInViewport';
import { centralHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import Layout from '../layouts/main.layout';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { User } from '../models/user';
import { Experience, Person } from '../ui-kit/icons';
import HeaderProfileSection from './HeaderProfileSection';
import ProfileDetailCard from './ProfileDetailCard';
import ProfileSectionSelector, { Section } from './ProfileSectionSelector';
import ProfileStickyCard from './ProfileStickyCard';
import UpcomingSessionSection from './UpcomingSessionSection';
import { ITokenObject } from '../models/auth';

const PublicUserProfilePage = ({ token }: { token: ITokenObject }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { ref: headerRef, isVisible: isHeaderVisible } = useIsInViewport({
    threshold: 0,
    rootMargin: '-64px',
  });
  const bioRef = useRef<HTMLDivElement | null>(null);
  const expRef = useRef<HTMLDivElement | null>(null);

  const section = Object.values<string>(Section).includes(
    router.query.section as string,
  )
    ? (router.query.section as Section)
    : Section.ABOUT;

  const [user, setUser] = useState<User | undefined>();
  const [isOwner, setIsOwner] = useState<boolean | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data } = await centralHttp.get<BaseResponseDto<User>>(
        API_PATHS.INSTRUCTOR_PROFILE.replace(':id', router.query.id as string),
      );

      setUser(data.data);
      setIsOwner(token.user.id === data.data?.id);
    };

    initialize()
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const upcomingSessionSection = useMemo(
    () =>
      user?.id && (
        <UpcomingSessionSection instructorId={user.id} token={{ token }} />
      ),
    [user],
  );

  if (isLoading) return null;
  if (!user) return <Error statusCode={404} />;

  return (
    <Layout token={{ token }} noMobilePadding={true}>
      <Head>
        <title>
          {t('headerText')} | {`${user.firstName} ${user.lastName}`}
        </title>
      </Head>
      <HeaderProfileSection user={user} refProp={headerRef} />
      <ProfileSectionSelector showProfile={!isHeaderVisible} user={user} />
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex w-full max-w-screen-lg flex-row px-6 lg:space-x-8">
          {section === Section.ABOUT && (
            <>
              <div className="mt-6 hidden lg:block lg:w-3/12">
                <ProfileStickyCard
                  className="top-28"
                  cardProps={[
                    {
                      icon: (
                        <Person className="h-5 w-5 text-gray-300 transition-colors group-hover:text-brand-primary" />
                      ),
                      text: t('publicUserProfilePage.bio'),
                      ref: bioRef,
                    },
                    {
                      icon: (
                        <Experience className="h-5 w-5 text-gray-300 transition-colors group-hover:text-brand-primary" />
                      ),
                      text: t('publicUserProfilePage.experience'),
                      ref: expRef,
                    },
                  ]}
                />
              </div>
              <div className="mt-6 w-full space-y-8 lg:w-9/12 lg:flex-shrink-0">
                <ProfileDetailCard
                  heading={t('publicUserProfilePage.bio')}
                  icon={<Person className="h-6 w-6 text-gray-650" />}
                  markdown={user.bio}
                  refProp={bioRef}
                  className="border-b border-gray-200"
                  isOwner={isOwner}
                />
                <ProfileDetailCard
                  heading={t('publicUserProfilePage.experience')}
                  icon={<Experience className="h-6 w-6 text-gray-650" />}
                  markdown={user.experience}
                  refProp={expRef}
                  isOwner={isOwner}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {section === Section.UPCOMING && upcomingSessionSection}
    </Layout>
  );
};

export default PublicUserProfilePage;
