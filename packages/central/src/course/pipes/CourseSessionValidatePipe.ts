import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CourseSessionService } from '../courseSession.service';

@Injectable()
export class CourseSessionValidatePipe implements PipeTransform {
  constructor(private readonly courseSessionService: CourseSessionService) {}

  async transform(value: any) {
    const isExists = await this.courseSessionService.isExistsCourseSession(
      value,
    );
    if (!isExists)
      throw new HttpException(
        'Course Session not found.',
        HttpStatus.NOT_FOUND,
      );

    return value;
  }
}
