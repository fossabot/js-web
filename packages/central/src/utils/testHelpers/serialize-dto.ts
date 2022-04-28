/**
 * For simulate going through nestjs validation pipe for dto.
 * But by using dto instance as parameter for convinent type-checking.
 * This will transform and validate according to class-validator/class-transformer decorator applied to dto.
 */

import { classToClass } from 'class-transformer';
import { validate } from 'class-validator';

export async function serializeDto<T extends Record<string, any>>(dto: T) {
  const transformedDto = classToClass(dto);
  const validationError = await validate(transformedDto);
  expect(validationError).toEqual([]);

  return transformedDto;
}
