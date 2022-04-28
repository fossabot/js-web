import { TestingModule } from '@nestjs/testing';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { EntityManager } from 'typeorm';
import { Policy } from '@seaccentral/core/dist/user/Policy.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { RolePolicy } from '@seaccentral/core/dist/user/RolePolicy.entity';
import { PolicyService } from './policy.service';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';

describe('PolicyService', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterEach(async () => {
    await teardownApp(app);
  });

  describe('#getPolicies', () => {
    it('should return [] given that user role has no policy', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({ email: 'john.doe@mail.com' })
        .save();

      const policies = await app.get(PolicyService).getPolicies(user);

      expect(policies).toEqual([]);
    });

    it('should return expected policy names given user role policies', async () => {
      const [user, myRole1, myRole2, myRole3, myPolicy1, myPolicy2] =
        await Promise.all([
          app
            .get(EntityManager)
            .getRepository(User)
            .create({ email: 'john.doe@mail.com' })
            .save(),
          app
            .get(EntityManager)
            .getRepository(Role)
            .create({ name: 'myRole1' })
            .save(),
          app
            .get(EntityManager)
            .getRepository(Role)
            .create({ name: 'myRole2' })
            .save(),
          app
            .get(EntityManager)
            .getRepository(Role)
            .create({ name: 'myRole3' })
            .save(),
          app
            .get(EntityManager)
            .getRepository(Policy)
            .create({ name: 'myPolicy1' })
            .save(),
          app
            .get(EntityManager)
            .getRepository(Policy)
            .create({ name: 'myPolicy2' })
            .save(),
          app
            .get(EntityManager)
            .getRepository(Policy)
            .create({ name: 'myPolicy3' })
            .save(),
        ]);
      await Promise.all([
        app
          .get(EntityManager)
          .getRepository(UserRole)
          .insert([
            { user, role: myRole1 },
            { user, role: myRole2 },
            { user, role: myRole3 },
          ]),
        app
          .get(EntityManager)
          .getRepository(RolePolicy)
          .insert([
            { role: myRole1, policy: myPolicy1 },
            { role: myRole2, policy: myPolicy1 },
            { role: myRole3, policy: myPolicy2 },
          ]),
      ]);

      const policies = await app.get(PolicyService).getPolicies(user);

      expect(policies.filter((val) => val === myPolicy1.name).length).toBe(1);
      expect(policies.filter((val) => val === myPolicy2.name).length).toBe(1);
    });
  });
});
