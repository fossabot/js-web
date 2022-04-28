import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { Connection } from 'typeorm';
import { get } from 'lodash';
import { AppModule } from '../../app.module';

export async function setupApp(envoveridde = {}) {
  const app = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: (key: string) => get({ ...process.env, ...envoveridde }, key),
    })
    .compile();

  await app.get(Connection).synchronize(true);
  await app.get(UsersService).populateRoles();

  return app;
}

export async function teardownApp(app: TestingModule) {
  await app.get(Connection).close();
  await app.close();
}
