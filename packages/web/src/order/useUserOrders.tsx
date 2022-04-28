import { useEffect, useState } from 'react';
import API_PATHS from '../constants/apiPaths';
import { paymentHttp } from '../http';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { UserOrder } from '../models/userOrder';

const PER_PAGE = 10;

export const useUserOrders = (userId?: string) => {
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isEnded, setIsEnded] = useState(false);

  const fetchOrders = async (page: number) => {
    if (isFetching) return;

    setPage(page);
    setIsFetching(true);
    try {
      const params: { [key: string]: any } = {
        page,
        perPage: PER_PAGE,
      };

      if (userId) {
        params.userId = userId;
      }

      const { data: result } = await paymentHttp.get<
        BaseResponseDto<UserOrder[]>
      >(userId ? API_PATHS.ORDER_USER : API_PATHS.ORDER_ME, {
        params,
      });
      setOrders((orders) => {
        if (page <= 1) {
          return result.data;
        } else {
          return [...orders, ...result.data];
        }
      });
      setIsEnded(page >= result.pagination.totalPages);
    } catch (err) {
    } finally {
      setIsFetching(false);
    }
  };

  const fetchMoreOrders = () => {
    if (!isEnded) {
      fetchOrders(page + 1);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  return { fetchMoreOrders, orders, isFetching };
};
