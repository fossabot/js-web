import { useForgotPasswordForm } from '../ForgotPassword';
import { renderHook, act } from '@testing-library/react-hooks';
import axios from 'axios';

describe('ForgotPassword', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useForgotPasswordForm', () => {
    describe('#callApiForgotPassword', () => {
      it('set success state to true', async () => {
        jest.spyOn(axios, 'post').mockResolvedValueOnce('OK');

        const { result } = renderHook(() => useForgotPasswordForm());
        const callApiForgotPassword = result.current.callApiForgotPassword;

        await act(() => callApiForgotPassword({ email: 'john.doe@mail.com' }));

        expect(result.current.isSuccess).toBe(true);
      });

      it('set success state to false if error', async () => {
        jest.spyOn(axios, 'post').mockRejectedValueOnce('NO OK');

        const { result } = renderHook(() => useForgotPasswordForm());
        const callApiForgotPassword = result.current.callApiForgotPassword;

        await act(() => callApiForgotPassword({ email: '' }));

        expect(result.current.isSuccess).toBe(false);
      });
    });
  });
});
