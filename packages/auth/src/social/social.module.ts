import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { SocialService } from './social.service';
import { GoogleStrategy } from './google.strategy';
import { AuthModule } from '../index/index.module';
import { SocialController } from './social.controller';
import { LinkedinStrategy } from './linkedin.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { AuthFailRedirectFilter } from '../filter/authFailRedirect.filter';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PassportModule.register({ session: false }),
    CRMModule,
  ],
  providers: [
    SocialService,
    GoogleStrategy,
    LinkedinStrategy,
    FacebookStrategy,
    AuthFailRedirectFilter,
  ],
  controllers: [SocialController],
})
export class SocialModule {}
