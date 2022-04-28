import * as nextRouter from 'next/router';
import { renderHook, act } from '@testing-library/react-hooks';

import WEB_PATHS from '../../constants/webPaths';
import { useTokenValidation } from '../ResetPassword';
import axios from 'axios';

describe('useTokenValidation', () => {
  let routerSpy;

  beforeEach(() => {
    routerSpy = {
      replace: jest.fn(),
    };
    jest.spyOn(nextRouter, 'useRouter').mockReturnValue(routerSpy);
  });

  describe('#validateToken', () => {
    it('not call redirect if token is valid', async () => {
      jest.spyOn(axios, 'post').mockResolvedValueOnce('OK');

      const { result } = renderHook(() => useTokenValidation());
      const validateToken = result.current.validateToken;

      await act(() => validateToken('validToken'));

      expect(routerSpy.replace).not.toBeCalled();
    });

    it('call redirect to / if token is invalid', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce('NO OK');

      const { result } = renderHook(() => useTokenValidation());
      const validateToken = result.current.validateToken;

      await act(() => validateToken(''));

      expect(routerSpy.replace).toBeCalledWith(WEB_PATHS.LOGIN);
    });
  });
});
