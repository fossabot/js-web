import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { SeedService } from '@seaccentral/core/dist/seed/seed.service';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { AppModule } from '../../app.module';

export async function clearDbModels(app: INestApplication) {
  await app.get(Connection).synchronize(true);
}

export async function setupServer() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

export async function beforeEachServer(app: INestApplication) {
  await clearDbModels(app);
  await app.get(SeedService).createPasswordSetting();
  await app.get(UsersService).populateRoles();
}

export async function teardownServer(app: INestApplication) {
  await app.get(Connection).close();
  await app.close();
}
