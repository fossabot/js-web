import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../user/Gender.enum';
import { Industry } from '../user/Industry.entity';
import { CompanySizeRange } from '../user/Range.entity';
import { UserTitle } from '../user/userTitle.enum';
import { User } from '../user/User.entity';
import { IndustryDto } from './Industry.dto';
import { RangeBaseDto } from './RangeBase.dto';

export class UserDto extends User {
  @ApiProperty({ type: 'string', nullable: true })
  username: string | null;

  @ApiProperty({ type: 'string', format: 'email', nullable: true })
  email?: string;

  @ApiProperty()
  isEmailConfirmed: boolean;

  @ApiProperty({ type: 'string', nullable: true })
  phoneNumber: string | null;

  @ApiProperty()
  isPhoneNumberConfirmed: boolean;

  @ApiProperty()
  isTwoFactorEnabled: boolean;

  @ApiProperty()
  isLockedOut: boolean;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  lockoutEndDateUTC: Date | null;

  @ApiProperty()
  accessFailedCount: number;

  @ApiProperty({ type: 'string', nullable: true })
  emailVerificationKey: string | null;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  dob: Date | null;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  emailVerificationRequestDateUTC: Date | null;

  @ApiProperty({ type: 'string', nullable: true })
  passwordResetKey: string | null;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  passwordResetRequestDateUTC: Date | null;

  @ApiProperty({ enum: UserTitle, nullable: true })
  title: UserTitle | null;

  @ApiProperty({ type: 'string', nullable: true })
  firstName: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  lastName: string | null;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty({ type: 'string', nullable: true })
  zipCode: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  jobTitle: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  department: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  companyName: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  ageRangeId: string;

  @ApiProperty({ type: 'string', nullable: true })
  industryId: string;

  @ApiProperty({ type: IndustryDto, nullable: true })
  industry: Industry | null;

  @ApiProperty({ type: RangeBaseDto })
  companySizeRange: CompanySizeRange | null;

  @ApiProperty({ type: 'string', nullable: true })
  skillsToImprove: string | null;

  @ApiProperty()
  isActivated: boolean;

  @ApiProperty({ type: 'string', nullable: true })
  lineId: string | null;

  @ApiProperty()
  lineIdVisible: boolean;

  @ApiProperty()
  dobVisible: boolean;

  /**
   * For identifying user migrated from instancy
   */
  @ApiProperty()
  isInstancy: boolean;

  /**
   * CRM user id for identifying central user and crm user
   */

  @ApiProperty({ nullable: true })
  seacId: string;
}
