import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { SeedService } from '@seaccentral/core/dist/seed/seed.service';
import { Connection } from 'typeorm';
import { AppModule } from '../../app.module';

export async function setupApp() {
  const app = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  await app.get(Connection).synchronize(true);
  await app.get(UsersService).populateRoles();
  await app.get(SeedService).createPasswordSetting();
  await app.get(SeedService).createMockedPlans();

  return app;
}

export async function teardownApp(app: TestingModule) {
  await app.get(Connection).close();
  await app.close();
}
