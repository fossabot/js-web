import { useAuthInfo } from './useAuthInfo';
import { AuthContext } from './authContext';
import { renderHook } from '@testing-library/react-hooks';
import { BACKEND_ADMIN_CONTROL, GOD_MODE } from '../constants/policies';

describe('useAuthInfo', () => {
  it('returns expected context value', () => {
    const initialContext = {
      isLoading: false,
      policies: [],
      token: {
        jwtToken: '',
        jwtTokenExpiry: '',
        user: {
          email: '',
          firstName: '',
          id: '',
          isActive: false,
          isEmailConfirmed: false,
          isPhoneNumberConfirmed: false,
          isActivated: true,
          lastName: '',
          phoneNumber: null,
        },
      },
    };
    const wrapper = ({ children }) => (
      <AuthContext.Provider value={initialContext}>
        {children}
      </AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuthInfo(), { wrapper });
    const { context } = result.current;

    expect(context).toEqual(initialContext);
  });

  describe('#canAccess', () => {
    function setupInitialContext(policies: string[]) {
      const initialContext = {
        isLoading: false,
        policies,
        token: {
          jwtToken: '',
          jwtTokenExpiry: '',
          user: {
            email: '',
            firstName: '',
            id: '',
            isActive: false,
            isEmailConfirmed: false,
            isPhoneNumberConfirmed: false,
            isActivated: true,
            lastName: '',
            phoneNumber: null,
          },
        },
      };
      const wrapper = ({ children }) => (
        <AuthContext.Provider value={initialContext}>
          {children}
        </AuthContext.Provider>
      );

      return wrapper;
    }

    it('should return false given no policies in context', async () => {
      const wrapper = setupInitialContext([]);
      const { result } = renderHook(() => useAuthInfo(), { wrapper });

      const isGranted = result.current.canAccess(GOD_MODE.GRANT_ALL_ACCESS);

      expect(isGranted).toBe(false);
    });

    it('should return true given context policy name "grantAllAccess"', () => {
      const allAccessPolicy = 'grantAllAccess';
      const wrapper = setupInitialContext([allAccessPolicy]);
      const { result } = renderHook(() => useAuthInfo(), { wrapper });

      const isGranted = result.current.canAccess(GOD_MODE.GRANT_ALL_ACCESS);

      expect(isGranted).toBe(true);
    });

    it('should return true given policyName exist in context policies', () => {
      const wrapper = setupInitialContext([
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
      ]);
      const { result } = renderHook(() => useAuthInfo(), { wrapper });

      const isGranted = result.current.canAccess(
        BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
      );

      expect(isGranted).toBe(true);
    });
  });
});
