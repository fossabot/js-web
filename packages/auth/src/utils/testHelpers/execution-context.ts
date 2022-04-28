import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import td from 'testdouble';

export function fakeRequestResponse(
  reqProps?: Partial<Request>,
  resProps?: Partial<Response>,
) {
  const executionContext = td.object<ExecutionContext>();
  const httpArgumentsHost = td.object<HttpArgumentsHost>();
  const request = td.object<Request>();
  const response = td.object<Response>();

  td.when(executionContext.switchToHttp()).thenReturn(httpArgumentsHost);
  td.when(httpArgumentsHost.getRequest<Request>()).thenReturn(
    Object.assign(request, reqProps),
  );
  td.when(httpArgumentsHost.getResponse<Response>()).thenReturn(
    Object.assign(response, resProps),
  );

  return executionContext;
}
