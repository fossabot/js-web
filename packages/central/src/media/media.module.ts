import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CoreMediaModule } from '@seaccentral/core/dist/media/coreMedia.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { JWPlayerModule } from '../jwplayer/jwplayer.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    CoreMediaModule,
    UsersModule,
    JWPlayerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
