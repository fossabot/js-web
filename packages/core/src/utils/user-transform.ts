/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { User } from '../user/User.entity';

export class PartialUser extends User {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', nullable: true })
  email?: string;

  @ApiProperty({ type: 'string', nullable: true })
  firstName: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  lastName: string | null;
}

export function transformUser(user: User, extra?: DeepPartial<User>) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    ...extra,
  };
}
