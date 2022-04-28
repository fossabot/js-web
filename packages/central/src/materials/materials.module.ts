import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CoreMaterialModule } from '@seaccentral/core/dist/material/coreMaterial.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { InternalMaterialsService } from './internalMaterials.service';
import { ExternalMaterialsService } from './externalMaterials.service';
import { MaterialsController } from './materials.controller';
import { UploadModule } from '../upload/upload.module';
import { BaseMaterialsService } from './baseMaterials.service';

@Module({
  imports: [
    CoreMaterialModule,
    UploadModule,
    UsersModule,
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
  controllers: [MaterialsController],
  providers: [
    InternalMaterialsService,
    ExternalMaterialsService,
    BaseMaterialsService,
  ],
  exports: [InternalMaterialsService],
})
export class MaterialsModule {}
