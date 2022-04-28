import { ApiProperty } from '@nestjs/swagger';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InstructorResponseDto extends User {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  profileImageKey: string;

  @Expose()
  @ApiProperty()
  bio: string;

  @Expose()
  @ApiProperty()
  experience: string;

  @Expose()
  @ApiProperty()
  shortSummary: string;

  constructor(instuctor: Partial<User>) {
    super();
    Object.assign(this, instuctor);
  }
}
