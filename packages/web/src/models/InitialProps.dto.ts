/**
 * Typing support for return value of 'getInitialProps' that are wrapped with 'withAuth' hoc
 */

export class InitialPropsDto<T> {
  data: T;

  token: string;

  errors?: Error[];

  statusCode?: number;
}
