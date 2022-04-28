import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginSetting } from '../admin/Login.setting.entity';
import { PasswordSetting } from '../admin/Password.setting.entity';
import { ExternalProviderModule } from '../external-package-provider/external.provider.module';
import { CoreGroupModule } from '../group/coreGroup.module';
import { Invitation } from '../invitation/Invitation.entity';
import { Organization } from '../organization/Organization.entity';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { QueueModule } from '../queue/queue.module';
import { Industry } from './Industry.entity';
import { PasswordRecord } from './PasswordRecord.entity';
import { Policy } from './Policy.entity';
import { AgeRange, CompanySizeRange, RangeBase } from './Range.entity';
import { Role } from './Role.entity';
import { RolePolicy } from './RolePolicy.entity';
import { User } from './User.entity';
import { UserAuthProvider } from './UserAuthProvider.entity';
import { UserRole } from './UserRole.entity';
import { UsersService } from './users.service';
import { UserSession } from './UserSession.entity';
import { UserTaxInvoice } from './UserTaxInvoice.entity';
import { UserThirdParty } from './UserThirdParty.entity';
import { UserUploadHistory } from './UserUploadHistory.entity';

@Module({
  imports: [
    ExternalProviderModule,
    CoreGroupModule,
    QueueModule,
    TypeOrmModule.forFeature([
      PasswordSetting,
      User,
      UserAuthProvider,
      UserSession,
      LoginSetting,
      Role,
      Invitation,
      UserRole,
      PasswordRecord,
      Organization,
      OrganizationUser,
      UserUploadHistory,
      AgeRange,
      RangeBase,
      Industry,
      CompanySizeRange,
      Policy,
      UserThirdParty,
      RolePolicy,
      UserTaxInvoice,
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
