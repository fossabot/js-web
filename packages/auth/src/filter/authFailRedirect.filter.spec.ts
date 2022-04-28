/* eslint-disable max-classes-per-file */

import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import td from 'testdouble';
import { IncomingHttpHeaders } from 'http';
import { ConfigService } from '@nestjs/config';
import LMSException from '@seaccentral/core/dist/error/lmsException';
import { Exclude, Expose, Transform } from 'class-transformer';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';
import { fakeRequestResponse } from '../utils/testHelpers/execution-context';
import { AuthFailRedirectFilter } from './authFailRedirect.filter';

class LMSError extends LMSException {
  code: 'ERROR CODE';
}

describe('AuthFailRedirectFilter', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterEach(() => {
    td.reset();
  });

  afterAll(async () => {
    await teardownApp(app);
  });

  describe('#catch', () => {
    it('redirect to referer url if valid referer url', () => {
      const headers = td.object<IncomingHttpHeaders>();
      headers.referer = 'http://example.com';
      const executionContext = fakeRequestResponse({ headers });
      const errorData = 'An error message';

      const urlString = app
        .get(AuthFailRedirectFilter)
        .catch(new LMSError(errorData, 400), executionContext);

      const url = new URL(urlString);
      expect(url.origin).toEqual(headers.referer);
    });

    it('redirect to default url if invalid referer url', () => {
      const headers = td.object<IncomingHttpHeaders>();
      headers.referer = '';
      const executionContext = fakeRequestResponse({ headers });
      const errorData = 'An error message';

      const urlString = app
        .get(AuthFailRedirectFilter)
        .catch(new LMSError(errorData, 400), executionContext);

      const defaultRedirectUrl = app.get(ConfigService).get('CLIENT_BASE_URL');
      const url = new URL(urlString);
      expect(url.origin).toEqual(defaultRedirectUrl);
    });

    it('transform exception data if data is object', () => {
      class ErrorData {
        @Expose()
        publicField: string;

        @Exclude()
        privateField: string;

        @Transform(({ value }) => !value)
        toggleBooleanField: boolean;

        constructor(data: Partial<ErrorData>) {
          Object.assign(this, data);
        }
      }
      const errorData = new ErrorData({
        publicField: 'publicField',
        privateField: 'privateField',
        toggleBooleanField: false,
      });
      const executionContext = fakeRequestResponse();

      const urlString = app
        .get(AuthFailRedirectFilter)
        .catch(new LMSError(errorData, 400), executionContext);

      const url = new URL(urlString);
      const data = JSON.parse(url.searchParams.get('data') as string);
      expect(data.publicField).toEqual(errorData.publicField);
      expect(data.privateField).not.toBeDefined();
      expect(data.toggleBooleanField).toBe(!errorData.toggleBooleanField);
    });
  });
});
