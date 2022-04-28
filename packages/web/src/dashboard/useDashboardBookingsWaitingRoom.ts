import { useRouter } from 'next/router';
import API_PATHS from '../constants/apiPaths';
import WEB_PATHS from '../constants/webPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import {
  CourseSubCategoryKey,
  ICourseSessionBooking,
  RelatedCoursesCancellationResponse,
} from '../models/course';
import { Language } from '../models/language';
import { CalendarOptions, ICalendar } from 'datebook';
import { useLocaleText } from '../i18n/useLocaleText';
import { useEffect, useState } from 'react';

export function useDashboardBookingsWaitingRoom() {
  const router = useRouter();
  const localeText = useLocaleText();
  const [sessionBooking, setSessionBooking] =
    useState<ICourseSessionBooking<Language>>();
  const [canceling, setCancel] = useState<boolean>(false);
  const [modalData, setModalData] =
    useState<RelatedCoursesCancellationResponse<Language>>(undefined);
  const [sessionState, setSessionState] =
    useState<'willStart' | 'soon' | 'inProgress' | 'ended'>();

  useEffect(() => {
    fetchSessionBooking();
  }, []);

  async function fetchSessionBooking() {
    const { data } = await centralHttp.get<
      BaseResponseDto<ICourseSessionBooking<Language>>
    >(
      API_PATHS.COURSE_SESSIONS_BOOKING.replace(
        ':bookingId',
        router.query.id as string,
      ),
    );
    setSessionBooking(data.data);
  }

  async function validateCancelBooking() {
    const { id } = sessionBooking.session;
    const { data } = await centralHttp.get<
      BaseResponseDto<RelatedCoursesCancellationResponse<Language>>
    >(API_PATHS.COURSE_SESSION_CALCELLING_VALIDATE.replace(':id', id));
    setModalData(data.data);
  }

  async function handleCancelBooking() {
    const { id, startDateTime } = sessionBooking.session;
    setCancel(true);
    await centralHttp.delete(API_PATHS.BOOK_COURSE_SESSION.replace(':id', id));
    setCancel(false);
    router.push(
      WEB_PATHS.DASHBOARD_BOOKINGS +
        `?infoNoti=true&cancelBookingStartDateTime=${startDateTime}&noOfCancellation=${
          [id, ...modalData.relatedBookings].length
        }`,
    );
  }

  function downloadIcs() {
    const title = localeText(sessionBooking.outline.title);
    const config: CalendarOptions = {
      title,
      location:
        sessionBooking.outline.category.key === CourseSubCategoryKey.VIRTUAL
          ? sessionBooking.session.participantUrl
          : sessionBooking.session.location,
      description: localeText(sessionBooking.outline.description),
      start: new Date(sessionBooking.session.startDateTime),
      end: new Date(sessionBooking.session.endDateTime),
    };
    const icalendar = new ICalendar(config);

    icalendar.download(`${title}.ics`);
  }

  return {
    sessionBooking,
    handleCancelBooking,
    downloadIcs,
    canceling,
    setSessionState,
    sessionState,
    validateCancelBooking,
    modalData,
  };
}
