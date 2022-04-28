import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Exclude, Expose, Transform } from 'class-transformer';

function transformRoles({ obj }: { obj: User }) {
  if (!!obj.userRoles && obj.userRoles.length) {
    const defaultRole = obj.userRoles.find((v) => v.isDefault);
    if (defaultRole && defaultRole.role) {
      const { id, name } = defaultRole.role;
      return { id, name };
    }
    return null;
  }
  return null;
}

@Exclude()
export class GetAllUsers extends User {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  username: string | null;

  @Expose()
  @ApiProperty({ format: 'email' })
  email: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  isEmailConfirmed: boolean;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  phoneNumber: string | null;

  @Expose()
  @ApiProperty()
  isTwoFactorEnabled: boolean;

  @Expose()
  @ApiProperty()
  isLockedOut: boolean;

  @Expose()
  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  lockoutEndDateUTC: Date | null;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  firstName: string | null;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  lastName: string | null;

  @Expose()
  @ApiProperty()
  isActivated: boolean;

  @Expose()
  @Transform(transformRoles)
  @ApiProperty({
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
    },
  })
  defaultRole: Role;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
