import { ApiProperty } from '@nestjs/swagger';
import { IsArray, Matches } from 'class-validator';

import { EMAIL_PATTERN } from '../utils/constants';

export class UserEmails {
  @IsArray()
  @Matches(EMAIL_PATTERN, undefined, { each: true })
  @ApiProperty()
  emails: string[];
}
