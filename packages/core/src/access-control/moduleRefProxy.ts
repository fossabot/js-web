import { Type } from '@nestjs/common';
import { ContextId, ModuleRef } from '@nestjs/core';

export class ModuleRefProxy {
  constructor(private readonly ref: ModuleRef) {}

  get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | string | symbol,
  ): TResult {
    return this.ref.get(typeOrToken, { strict: false });
  }

  resolve<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | string | symbol,
    contextId?: ContextId,
  ): Promise<TResult> {
    return this.ref.resolve(typeOrToken, contextId, { strict: false });
  }
}
