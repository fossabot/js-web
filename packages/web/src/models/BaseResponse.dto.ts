/**
 * For adding typing support to our api response
 */

import IPaginationParams from './IPaginationParams';

export class BaseResponseDto<T> {
  data?: T;

  code?: string;

  message?: string | Array<string>;

  pagination?: IPaginationParams;
}
