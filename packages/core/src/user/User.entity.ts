import { Check, Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import crypt from 'crypto';
import { Base } from '../base/Base.entity';
import { CourseSessionInstructor } from '../course/CourseSessionInstructor.entity';
import { GroupUser } from '../group/GroupUser.entity';
import { LanguageCode } from '../language/Language.entity';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { Subscription } from '../payment/Subscription.entity';
import { EMAIL_PATTERN } from '../utils/constants';
import { Gender } from './Gender.enum';
import { Industry } from './Industry.entity';
import { AgeRange, CompanySizeRange } from './Range.entity';
import { UserRole } from './UserRole.entity';
import { UserTitle } from './userTitle.enum';

@Entity()
@Index('email_search_index', ['email'])
@Index('username_search_index', ['username'])
@Check('"username" IS NOT NULL OR "email" IS NOT NULL')
export class User extends Base {
  @Column({ type: 'citext', nullable: true })
  @Index('username_unique_index', {
    unique: true,
    where: 'username IS NOT NULL',
  })
  username!: string | null;

  @Column({ type: 'citext', nullable: true })
  @Index('email_unique_index', { unique: true, where: 'email IS NOT NULL' })
  @Check('email_check', `email ~* '${EMAIL_PATTERN}'`)
  email?: string;

  @Column({ default: false })
  isEmailConfirmed!: boolean;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Index('phoneNumber_unique_index', {
    unique: true,
    where: '"phoneNumber" IS NOT NULL',
  })
  phoneNumber!: string | null;

  @Column({ default: false })
  isPhoneNumberConfirmed!: boolean;

  @Column({ default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ default: false })
  isLockedOut!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lockoutEndDateUTC!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginDate!: Date | null;

  @Column({ default: 0 })
  accessFailedCount!: number;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationKey!: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  dob!: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  emailVerificationRequestDateUTC!: Date | null;

  @Column({ nullable: true, type: 'text' })
  passwordResetKey!: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  passwordResetRequestDateUTC!: Date | null;

  @Column({ type: 'enum', enum: UserTitle, nullable: true })
  title!: UserTitle | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName!: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender!: Gender | null;

  @Column({ nullable: true })
  ageRangeId: string;

  @ManyToOne(() => AgeRange, { nullable: true })
  ageRange!: AgeRange | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  zipCode!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jobTitle!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName!: string | null;

  @Column({ nullable: true })
  industryId: string;

  @ManyToOne(() => Industry, { nullable: true, eager: true })
  industry!: Industry | null;

  @ManyToOne(() => CompanySizeRange, { nullable: true, eager: true })
  companySizeRange!: CompanySizeRange | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  skillsToImprove!: string | null;

  @Column({ type: 'boolean', default: true })
  isActivated: boolean;

  @Column({ type: 'varchar', nullable: true })
  lineId!: string | null;

  @Column({ default: false })
  lineIdVisible!: boolean;

  @Column({ default: false })
  dobVisible!: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
  userRoles: UserRole[];

  @OneToMany(() => GroupUser, (groupUser) => groupUser.user, { cascade: true })
  groupUser: GroupUser[];

  @OneToMany(
    () => OrganizationUser,
    (organizationUser) => organizationUser.user,
    { cascade: true },
  )
  organizationUser: OrganizationUser[];

  @OneToMany(
    () => CourseSessionInstructor,
    (courseSessionInstructor) => courseSessionInstructor.instructor,
  )
  courseSessionInstructors: CourseSessionInstructor[];

  /**
   * For identifying user migrated from instancy
   */
  @Column({ default: false })
  isInstancy: boolean;

  /**
   * CRM user id for identifying central user and crm user
   */
  @Column({ nullable: true, unique: true })
  seacId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  profileImageKey?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  shortSummary?: string | null;

  @Column({ type: 'varchar', length: 6000, nullable: true })
  bio?: string | null;

  @Column({ type: 'varchar', length: 6000, nullable: true })
  experience?: string | null;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @Column({
    type: 'enum',
    enum: LanguageCode,
    nullable: false,
    default: LanguageCode.EN,
  })
  emailNotificationLanguage!: LanguageCode;

  get fullName(): string {
    // eslint-disable-next-line no-use-before-define
    return getFullName({ ...this });
  }
}

export const getFullName = (val: {
  firstName: string | null;
  lastName: string | null;
}): string => {
  return `${val.firstName} ${val.lastName}`.trim();
};
