export const ERROR_CODES = {
  ERROR_USER_DEACTIVATED: {
    code: 'SEAC_101',
    message: 'User is deactivated',
  },
  WRONG_CURRENT_PASSWORD: {
    code: 'SEAC_AUTH_102',
    message: 'Wrong current password',
  },
  INVALID_SUBSCRIPTION: {
    code: 'SEAC_CENTRAL_101',
    message: 'Current subscription plan does not allow this action',
  },
  SUBSCRIPTION_WILL_EXPIRE: {
    code: 'SEAC_CENTRAL_102',
    message: 'Current subscription plan will expire before action will be done',
  },
  PREVIOUS_OUTLINE_NOT_BOOKED: {
    code: 'SEAC_CENTRAL_103',
    message:
      'Previous outline session should be booked to book this session according to pre booking rule',
  },
  SESSION_BOOKING_NOT_ALLOWED_BEFORE_PRE_BOOKING: {
    code: 'SEAC_CENTRAL_104',
    message:
      'Session booking is not allowed to book before previous outline session end time according to pre booking rule',
  },
  SESSION_BOOKING_OVERLAP: {
    code: 'SEAC_CENTRAL_105',
    message: 'This session booking overlaps with another booked session',
  },
  CANNOT_CANCEL_PRIVATE_COURSE_SESSION: {
    code: 'SEAC_CENTRAL_106',
    message: 'Cannot cancel a private course session',
  },

  CANNOT_UPGRADE_PLAN: {
    code: 'SEAC_PAYMENT_101',
    message:
      'Contact your admin to upgrade/renew/purchase this subscription plan',
  },
  COUPON_NOT_FOUND: {
    code: 'SEAC_PAYMENT_102',
    message: 'Coupon not found',
  },
  COUPON_INVALID: {
    code: 'SEAC_PAYMENT_103',
    message: 'Invalid coupon',
  },
  COUPON_REDEMPTION_EXCEED: {
    code: 'SEAC_PAYMENT_104',
    message: 'Redemption exceed',
  },
  ASSESSMENT_NOT_FOUND: {
    code: 'SEAC_CENTRAL_106',
    message: 'Assessment not found',
  },
  INSTRUCTOR_SESSION_TIME_OVERLAP: {
    code: 'SEAC_CENTRAL_108',
    message: 'This session overlaps with another session for the instructor',
  },
  SESSION_ADD_REGISTRANTS_EXCEED_SEATS_LIMIT: {
    code: 'SEAC_CENTRAL_109',
    message: 'Registrant over session limit',
  },

  OVERLAPPING_SYSTEM_ANNOUNCEMENTS: {
    code: 'SEAC_NOTIFICATION_101',
    message:
      'Cannot not have multiple active system announcements within the same dates',
  },
} as const;

export type ErrorCodeKeys = keyof typeof ERROR_CODES;
export type ErrorCode = typeof ERROR_CODES[ErrorCodeKeys]['code'];
export type ErrorCodesMap = {
  [key in ErrorCode]: {
    key: ErrorCodeKeys;
    message: string;
  };
};

// In case we need to find the error via code instead of the usual key
export const ERROR_CODES_MAP: ErrorCodesMap = Object.keys(ERROR_CODES).reduce(
  (map, key) => {
    map[ERROR_CODES[key].code] = {
      key,
      message: ERROR_CODES[key].message,
    };

    return map;
  },
  {} as ErrorCodesMap,
);
