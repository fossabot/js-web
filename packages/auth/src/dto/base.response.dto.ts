export class BaseResponseDto<T> {
  data?: T | Array<T>;

  code?: string;

  message?: string | Array<string>;
}
