import fileDownload from 'js-file-download';
import { useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { centralHttp, paymentHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { ISubscription } from './interface/ISubscription';
import { captureError } from '../utils/error-routing';

export function useMyPackagesPage() {
  const [isRequesting, setIsRequesting] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState([]);

  function isSubscriptionExpired(subscription: ISubscription) {
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const now = Date.now();
    return now < startDate.valueOf() || now > endDate.valueOf();
  }

  async function fetchMySubscriptions() {
    try {
      const { data } = await paymentHttp.get<BaseResponseDto<ISubscription[]>>(
        API_PATHS.MY_SUBSCRIPTIONS,
      );
      const subscriptions = data.data;
      setActiveSubscriptions(
        subscriptions.filter((s) => s.isActive && !isSubscriptionExpired(s)),
      );
      setExpiredSubscriptions(
        subscriptions.filter((s) => s.isActive && isSubscriptionExpired(s)),
      );
    } catch (error) {
      captureError(error);
    }
    setIsRequesting(false);
  }

  async function downloadCourseActivitiesRecord() {
    const res = await centralHttp.get(API_PATHS.COURSE_ACTIVITIES_RECORDS_ME, {
      responseType: 'blob',
    });
    fileDownload(res.data, 'course-reports.csv');
  }

  return {
    fetchMySubscriptions,
    isRequesting,
    activeSubscriptions,
    expiredSubscriptions,
    downloadCourseActivitiesRecord,
  };
}
