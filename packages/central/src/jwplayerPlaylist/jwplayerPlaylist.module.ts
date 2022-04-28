import { Module } from '@nestjs/common';
import { CorePlaylistModule } from '@seaccentral/core/dist/playlist/corePlaylist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { JWPlayerModule } from '../jwplayer/jwplayer.module';
import { JwplayerPlaylistController } from './jwplayerPlaylist.controller';
import { JwplayerPlaylistService } from './jwplayerPlaylist.service';
import { MediaPlaylistService } from './mediaPlaylist.service';

@Module({
  imports: [
    CorePlaylistModule,
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
  controllers: [JwplayerPlaylistController],
  providers: [JwplayerPlaylistService, MediaPlaylistService],
})
export class jwplayerPlaylistModule {}
