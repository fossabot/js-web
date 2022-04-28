import { AxiosError } from 'axios';
import { useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { paymentHttp } from '../http';
import { IPlan } from '../models/plan';

export function usePlan() {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [error, setError] = useState<AxiosError>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchPlans(packageType: string) {
    setLoading(true);
    try {
      const { data } = await paymentHttp.get(API_PATHS.PLANS, {
        params: { packageType, orderByDuration: 'asc' },
      });
      setPlans(data.data);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  }

  return { plans, fetchPlans, error, loading };
}
