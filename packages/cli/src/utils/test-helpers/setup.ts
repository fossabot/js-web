import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection } from 'typeorm';
import td from 'testdouble';
import { PoolClient } from 'pg';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { AppModule } from '../../app.module';
import { INSTANCY_DB_CONNECTION } from '../../instancy/instancyDbConnection';

export async function clearDbModels(app: INestApplication) {
  await app.get(Connection).synchronize(true);
}

export async function beforeAllApp() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(INSTANCY_DB_CONNECTION) // we can remove this if we want to connect a real database
    .useValue(td.object<PoolClient>())
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

export async function beforeEachApp(app: INestApplication) {
  await clearDbModels(app);
  await app.get(UsersService).populateRoles();
}

export async function afterEachApp(app: INestApplication) {
  await clearDbModels(app);
}

export async function afterAllApp(app: INestApplication) {
  await app.get(Connection).close();
  await app.close();
}
