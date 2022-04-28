import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';

export const POLICY_METADATA = 'policies';

export function Policy(...names: string[]): MethodDecorator & ClassDecorator {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (descriptor) {
      extendArrayMetadata(POLICY_METADATA, names, descriptor.value);
      return descriptor;
    }
    extendArrayMetadata(POLICY_METADATA, names, target);
    return target;
  };
}
