import {
  Matches,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return function IsNullableDecorator(
    prototype: Record<string, any>,
    propertyKey: string | symbol,
  ) {
    ValidateIf((obj) => obj[propertyKey] !== null, options)(
      prototype,
      propertyKey,
    );
  };
}

export function Deprecated() {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'deprecated',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} is deprecated. Should not submit this field`,
      },
      validator: {
        validate() {
          return false;
        },
      },
    });
  };
}

export function IsEqual<T extends Record<string, any>>(
  condition: (object: T) => any,
) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'IsEqual',
      target: object.constructor,
      propertyName,
      options: {
        message: ({
          property,
          value,
          object: targetObject,
        }: ValidationArguments) =>
          `${property} receives ${value}. Expect ${condition(
            targetObject as T,
          )}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value === condition(args.object as T);
        },
      },
    });
  };
}

export function IsCRMDate() {
  return Matches(
    /\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d\d:\d\d:\d\d/,
  );
}
