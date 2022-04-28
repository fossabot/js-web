import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ArrayNotEmptyPipe implements PipeTransform<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any): number {
    if (value.length <= 0) {
      throw new BadRequestException('List should not be empty.');
    }
    return value;
  }
}
