import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { connectionConfig } from '@seaccentral/core/dist/connection';
import { ConfigModule } from '@nestjs/config';
import { UserMigrationModule } from './user-migration/userMigration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...(connectionConfig as TypeOrmModuleAsyncOptions),
      autoLoadEntities: true,
    }),
    UserMigrationModule,
  ],
})
export class AppModule {}
