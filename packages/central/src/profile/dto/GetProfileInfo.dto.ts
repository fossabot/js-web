import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { CompanySizeRange } from '@seaccentral/core/dist/user/Range.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { DeepPartial } from 'typeorm';

export class GetProfileInfoDto {
  @Exclude()
  emailVerificationKey: string | null;

  @Transform(({ value }) => (value ? (value as Date).toISOString() : null))
  dob: Date | null;

  @Exclude()
  emailVerificationRequestDateUTC: Date | null;

  @Exclude()
  passwordResetKey: string | null;

  @Exclude()
  passwordResetRequestDateUTC: Date | null;

  @Exclude()
  userRoles: UserRole[];

  industry: Industry | null;

  companySizeRange: CompanySizeRange | null;

  private _roles: string[];

  @Expose()
  public get roles(): string[] {
    if (this._roles) return this._roles;

    this._roles = this.userRoles
      ? this.userRoles.reduce((prev, ur) => {
          if (ur.role?.name) prev.push(ur.role.name);
          return prev;
        }, [] as string[])
      : [];

    return this._roles;
  }

  constructor(partial: DeepPartial<GetProfileInfoDto>) {
    Object.assign(this, partial);
  }
}
