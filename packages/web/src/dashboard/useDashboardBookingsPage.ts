import { useEffect, useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { centralHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { min, max, sortBy } from 'lodash';
import { ICourseSession } from '../models/course';
import {
  addMonths,
  endOfDay,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfToday,
} from 'date-fns';
import { useRouter } from 'next/router';
import useTranslation from '../i18n/useTranslation';
import WEB_PATHS from '../constants/webPaths';
import {
  Reason,
  UserCourseSessionCancellationLog,
} from '../models/userCourseSessionCancellationLog';

export function useDashboardBookingsPage() {
  const today = new Date();
  const [selectDate, setSelectDate] = useState<Date>(today);
  const [bookings, setBookings] = useState<
    (ICourseSession & { cancelReason?: Reason })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const bookingDates: Date[] = bookings.map(
    (booking) => new Date(booking.startDateTime),
  );
  const router = useRouter();
  const [infoNotiMessage, setInfoNotiMessage] = useState<string>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchMyBookings();
    if (router.query.infoNoti) {
      notifyCancelBookingSuccess();
      router.replace(WEB_PATHS.DASHBOARD_BOOKINGS, undefined, {
        shallow: true,
      });
    }
  }, []);

  function isAllowDate(date: Date) {
    return !!bookings.find((booking) => {
      const startDate = new Date(booking.startDateTime);
      return (
        isSameDay(startDate, date) &&
        isSameMonth(startDate, date) &&
        isSameYear(startDate, date)
      );
    });
  }

  function minBookingDate() {
    return min(bookingDates) || today;
  }

  function maxBookingDate() {
    return max(bookingDates) || today;
  }

  async function fetchMyBookings() {
    setLoading(true);
    const { data } = await centralHttp.get<
      BaseResponseDto<{
        active: ICourseSession[];
        cancelled: UserCourseSessionCancellationLog[];
      }>
    >(API_PATHS.COURSE_SESSIONS_ME, {
      params: {
        startTime: startOfToday(),
        endTime: addMonths(startOfToday(), 3),
      },
    });
    const { active, cancelled } = data.data;
    const cancelledBookings: (ICourseSession & { cancelReason?: Reason })[] =
      cancelled
        .filter(
          (cancelledBooking) =>
            isAfter(
              endOfDay(new Date(cancelledBooking.courseSession.startDateTime)),
              new Date(),
            ) && cancelledBooking.reason !== Reason.CancelledByUser,
        )
        .map((cancelledBooking) => ({
          ...cancelledBooking.courseSession,
          cancelReason: cancelledBooking.reason,
        }));
    const sorted = sortBy(
      [...active, ...cancelledBookings],
      (o) => new Date(o.startDateTime),
    );
    setBookings(sorted);
    setLoading(false);

    return data.data;
  }

  function notifyCancelBookingSuccess() {
    const { cancelBookingStartDateTime, noOfCancellation } = router.query;
    const dateTime = new Date(cancelBookingStartDateTime as string);

    let noc = 0;
    if (typeof noOfCancellation === 'string') noc = parseInt(noOfCancellation);

    if (noc > 1)
      setInfoNotiMessage(
        t('dashboardBookingsPage.cancelMultiBookingSuccess', {
          amount: noc - 1,
        }),
      );
    else
      setInfoNotiMessage(
        t('dashboardBookingsPage.cancelBookingSuccess', {
          startDateTime: format(dateTime, 'dd MMM yyyy'),
          cancelTime: format(dateTime, 'H:mm'),
        }),
      );
  }

  function handleCloseInfoNoti() {
    setInfoNotiMessage(null);
  }

  function handleChangeDate(date: Date) {
    setSelectDate(date);
    const elementId = startOfDay(date).toJSON();
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }

  return {
    date: selectDate,
    isAllowDate,
    bookings,
    minBookingDate,
    maxBookingDate,
    loading,
    infoNotiMessage,
    handleCloseInfoNoti,
    handleChangeDate,
  };
}
