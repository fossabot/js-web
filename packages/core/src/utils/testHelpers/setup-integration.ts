import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { connectionConfig } from '../../connection';
import { SeedService } from '../../seed/seed.service';
import { UsersService } from '../../user/users.service';
import { UsersModule } from '../../user/users.module';
import { SeedModule } from '../../seed/seed.module';

export async function beforeAllApp(
  modules: (
    | Type<any>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<any>
  )[] = [],
  loadEnv: ConfigFactory = () => ({}),
) {
  connectionConfig.username = process.env.DB_USERNAME as string;
  connectionConfig.password = process.env.DB_PASSWORD as string;
  connectionConfig.database = process.env.DB_NAME_TEST as string;

  const app = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [loadEnv],
      }),
      TypeOrmModule.forRoot({
        ...(connectionConfig as TypeOrmModuleOptions),
        autoLoadEntities: true,
      }),
      UsersModule,
      SeedModule,
      ...modules,
    ],
  }).compile();

  return app;
}

export async function beforeEachApp(app: TestingModule) {
  await app.get(Connection).synchronize(true);
  await app.get(UsersService).populateRoles();
  await app.get(SeedService).createPasswordSetting();
  await app.get(SeedService).createMockedPlans();
}

export async function afterEachApp(app: TestingModule) {
  await app.get(Connection).synchronize(true);
}

export async function afterAllApp(app: TestingModule) {
  await app.get(Connection).close();
  await app.close();
}
