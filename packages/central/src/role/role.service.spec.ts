import { TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';

import { RoleService } from './role.service';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';

describe('RoleService', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterEach(async () => {
    await teardownApp(app);
  });

  describe('#getAllRoles', () => {
    it('should return all roles', async () => {
      const myRole = await app
        .get(EntityManager)
        .getRepository(Role)
        .create({ name: 'myRole' })
        .save();

      const { roles } = await app
        .get(RoleService)
        .getAllRoles({} as BaseQueryDto);

      expect(roles.find((role) => role.id === myRole.id)).toBeDefined();
    });
  });
});
