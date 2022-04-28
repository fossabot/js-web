import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import CourseSessionBookingCard from '../../course-session/CourseSessionBookingCard';
import CourseApi from '../../http/course.api';
import useTranslation from '../../i18n/useTranslation';
import MainLayout from '../../layouts/main.layout';
import { ITokenObject } from '../../models/auth';
import {
  CourseSubCategoryKey,
  ICourseOutline,
  ICourseSession,
  ICourseSessionBooking,
} from '../../models/course';
import { Language } from '../../models/language';
import MinimalNavbar from '../../ui-kit/headers/MinimalNavbar';
import { SystemError } from '../../ui-kit/SystemError';
import BookingConfirmationHeader from './BookingConfirmationHeader';
import SessionRules from './SessionRules';

export interface IBookingConfirmationPage {
  token: ITokenObject;
}

const BookingConfirmationPage: NextPage<IBookingConfirmationPage> = ({
  token,
}) => {
  const [courseSessionBooking, setCourseSessionBooking] =
    useState<ICourseSessionBooking<Language> | undefined>();
  const { session, outline, courseId } = courseSessionBooking || {};
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      setCourseSessionBooking(undefined);
      const { id } = router.query;
      const data = await CourseApi.getCourseSessionBooking(id as string);
      setCourseSessionBooking(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const head = useMemo(
    () => (
      <Head>
        <title>{`${t('headerText')} | ${t(
          'courseBookingConfirmationPage.title',
        )}`}</title>
      </Head>
    ),
    [],
  );

  if (isLoading) return null;
  if (error && !isLoading)
    return (
      <MainLayout
        head={head}
        header={<MinimalNavbar />}
        noMobilePadding={true}
        token={{ token }}
      >
        <SystemError error={error} resetError={initialize} />
      </MainLayout>
    );

  return (
    <MainLayout
      head={head}
      header={<MinimalNavbar />}
      noMobilePadding={true}
      token={{ token }}
    >
      <div className="flex w-full flex-col items-center justify-start py-6 lg:py-0">
        <div className="flex w-full max-w-screen-lg flex-col items-center">
          <div className="flex w-full flex-col lg:w-10/12">
            <BookingConfirmationHeader />

            <div className="mt-8 hidden border-t border-gray-200 lg:flex" />

            <div className="flex w-full flex-col lg:mt-8 lg:flex-row lg:space-x-8">
              <div className="flex w-full flex-col items-center">
                <CourseSessionBookingCard
                  className="w-full rounded-b-none rounded-t-none border-l-0 border-r-0 px-6 lg:rounded-2xl lg:border"
                  outline={outline as ICourseOutline<Language>}
                  session={session as ICourseSession}
                  courseId={courseId}
                />
                {outline.category.key === CourseSubCategoryKey.FACE_TO_FACE && (
                  <div className="0 mt-6 flex w-full flex-col border-t border-b border-gray-200 bg-gray-100 p-6 lg:mt-4 lg:rounded-2xl lg:border">
                    <div className="text-caption font-regular text-gray-650">
                      <p className="font-semibold">
                        {t('courseBookingConfirmationPage.location')}
                      </p>
                      <p className="mt-3 text-caption">{session.location}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 flex w-full flex-col px-6 lg:mt-0 lg:px-0">
                <SessionRules />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingConfirmationPage;
