/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */

import { ConfigModule } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PolicyActivatorGuard, PolicyGuard } from './policy.guard';
import { UserRole } from '../user/UserRole.entity';
import { Policy } from './policy.decorator';
import { Policy as PolicyEntity } from '../user/Policy.entity';
import { fakeRequestResponse } from '../utils/testHelpers/execution-context';
import { ModuleRefProxy } from './moduleRefProxy';
import { User } from '../user/User.entity';
import { Role } from '../user/Role.entity';
import { RolePolicy } from '../user/RolePolicy.entity';
import {
  afterAllApp,
  afterEachApp,
  beforeAllApp,
  beforeEachApp,
} from '../utils/testHelpers/setup-integration';

describe('PolicyGuard', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await beforeAllApp();
  });

  beforeEach(async () => {
    await beforeEachApp(app);
  });

  afterEach(async () => {
    await afterEachApp(app);
  });

  afterAll(async () => {
    await afterAllApp(app);
  });

  it('should throw error if passing Class without adding policy decorator on class', async () => {
    class MyClass {}

    const Guard = PolicyGuard(MyClass);

    expect(
      () =>
        new Guard(
          app.get(EntityManager).getRepository(UserRole),
          app.get(EntityManager).getRepository(PolicyEntity),
        ),
    ).toThrow();
  });

  it('should throw error if passing Method without adding policy decorator on method', async () => {
    class MyClass {
      myMethod() {}
    }

    const Guard = PolicyGuard(MyClass.prototype.myMethod);

    expect(
      () =>
        new Guard(
          app.get(EntityManager).getRepository(UserRole),
          app.get(EntityManager).getRepository(PolicyEntity),
        ),
    ).toThrow();
  });
});

describe('PolicyGuard, Policy', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await beforeAllApp();
  });

  beforeEach(async () => {
    await beforeEachApp(app);
  });

  afterEach(async () => {
    await afterEachApp(app);
  });

  afterAll(async () => {
    await afterAllApp(app);
  });

  it('should create expected policy name when apply policy decorator on class', async () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';

    @Policy(myPolicy1)
    class MyClass1 {}

    @Policy(myPolicy2)
    class MyClass2 {}

    @Policy(myPolicy1, myPolicy2)
    class MyClass3 {}

    const Guard = PolicyGuard(MyClass1, MyClass2, MyClass3);
    const userRoleRepository = app.get(EntityManager).getRepository(UserRole);
    const policyRepository = app.get(EntityManager).getRepository(PolicyEntity);
    const guard = new Guard(userRoleRepository, policyRepository);
    await guard.onModuleInit();

    const policies1 = await policyRepository.find({
      where: {
        name: myPolicy1,
      },
    });
    expect(policies1.length).toEqual(1);
    const policies2 = await policyRepository.find({
      where: {
        name: myPolicy2,
      },
    });
    expect(policies2.length).toEqual(1);
  });

  it('should create expected policy name when apply policy decorator on method', async () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';

    class MyClass {
      @Policy(myPolicy1)
      method1() {}

      @Policy(myPolicy2)
      method2() {}

      @Policy(myPolicy1, myPolicy2)
      method3() {}
    }

    const Guard = PolicyGuard(
      MyClass.prototype.method1,
      MyClass.prototype.method2,
      MyClass.prototype.method3,
    );
    const userRoleRepository = app.get(EntityManager).getRepository(UserRole);
    const policyRepository = app.get(EntityManager).getRepository(PolicyEntity);
    const guard = new Guard(userRoleRepository, policyRepository);
    await guard.onModuleInit();

    const policies1 = await policyRepository.find({
      where: {
        name: myPolicy1,
      },
    });
    expect(policies1.length).toEqual(1);
    const policies2 = await policyRepository.find({
      where: {
        name: myPolicy2,
      },
    });
    expect(policies2.length).toEqual(1);
  });

  it('should create class and method policy name when apply policy decorator on class and method passing only class name as an argument', async () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';

    @Policy(myPolicy1)
    class MyClass {
      @Policy(myPolicy2)
      method() {}
    }
    const Guard = PolicyGuard(MyClass);
    const userRoleRepository = app.get(EntityManager).getRepository(UserRole);
    const policyRepository = app.get(EntityManager).getRepository(PolicyEntity);
    const guard = new Guard(userRoleRepository, policyRepository);
    await guard.onModuleInit();

    const policies1 = await policyRepository.find({
      where: {
        name: myPolicy1,
      },
    });
    expect(policies1.length).toEqual(1);
    const policies2 = await policyRepository.find({
      where: {
        name: myPolicy2,
      },
    });
    expect(policies2.length).toEqual(1);
  });

  it('should create expected policy name when stacking policy decorator on class', async () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';

    @Policy(myPolicy1)
    @Policy(myPolicy2)
    class MyClass {}

    const Guard = PolicyGuard(MyClass);
    const userRoleRepository = app.get(EntityManager).getRepository(UserRole);
    const policyRepository = app.get(EntityManager).getRepository(PolicyEntity);
    const guard = new Guard(userRoleRepository, policyRepository);
    await guard.onModuleInit();

    const policies1 = await policyRepository.find({
      where: {
        name: myPolicy1,
      },
    });
    expect(policies1.length).toEqual(1);
    const policies2 = await policyRepository.find({
      where: {
        name: myPolicy2,
      },
    });
    expect(policies2.length).toEqual(1);
  });

  it('should create expected policy name when stacking policy decorator on method', async () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';

    class MyClass {
      @Policy(myPolicy1)
      @Policy(myPolicy2)
      method1() {}
    }

    const Guard = PolicyGuard(MyClass.prototype.method1);
    const userRoleRepository = app.get(EntityManager).getRepository(UserRole);
    const policyRepository = app.get(EntityManager).getRepository(PolicyEntity);
    const guard = new Guard(userRoleRepository, policyRepository);
    await guard.onModuleInit();

    const policies1 = await policyRepository.find({
      where: {
        name: myPolicy1,
      },
    });
    expect(policies1.length).toEqual(1);
    const policies2 = await policyRepository.find({
      where: {
        name: myPolicy2,
      },
    });
    expect(policies2.length).toEqual(1);
  });

  describe('#canActivate', () => {
    it('should return false if have no request.user', async () => {
      @Policy('myPolicy')
      class MyClass {}

      const Guard = PolicyGuard(MyClass);
      const guard = new Guard(
        app.get(EntityManager).getRepository(UserRole),
        app.get(EntityManager).getRepository(PolicyEntity),
        app.get(EntityManager).getRepository(RolePolicy),
      );
      await guard.onModuleInit();
      const executionContext = fakeRequestResponse({
        user: undefined,
      });
      const isGranted = await guard.canActivate(executionContext);
      expect(isGranted).toBe(false);
    });

    it('should return false if number of required policies > user role policies', async () => {
      const requiredPolicy1 = 'myPolicy1';
      const requiredPolicy2 = 'myPolicy2';
      @Policy(requiredPolicy1)
      class MyClass1 {}

      class MyClass2 {
        @Policy(requiredPolicy2)
        method() {}
      }

      const Guard = PolicyGuard(MyClass1, MyClass2.prototype.method);
      const guard = new Guard(
        app.get(EntityManager).getRepository(UserRole),
        app.get(EntityManager).getRepository(PolicyEntity),
        app.get(EntityManager).getRepository(RolePolicy),
      );
      await guard.onModuleInit();
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({ email: 'john.doe@mail.com' })
        .save();
      const myRole1 = await app
        .get(EntityManager)
        .getRepository(Role)
        .create({ name: 'myRole1' })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserRole)
        .create({ user, role: myRole1 })
        .save();

      const executionContext = fakeRequestResponse({
        user,
      });
      const isGranted = await guard.canActivate(executionContext);

      expect(isGranted).toBe(false);
    });

    it('should return true if all required policies exists in user role policies', async () => {
      const requiredPolicy1 = 'myPolicy1';
      const requiredPolicy2 = 'myPolicy2';
      @Policy(requiredPolicy1)
      class MyClass1 {}

      class MyClass2 {
        @Policy(requiredPolicy2)
        method() {}
      }

      const Guard = PolicyGuard(MyClass1, MyClass2.prototype.method);
      const guard = new Guard(
        app.get(EntityManager).getRepository(UserRole),
        app.get(EntityManager).getRepository(PolicyEntity),
        app.get(EntityManager).getRepository(RolePolicy),
      );
      await guard.onModuleInit();
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({ email: 'john.doe@mail.com' })
        .save();
      const myPolicy1 = await app
        .get(EntityManager)
        .getRepository(PolicyEntity)
        .findOneOrFail({ name: requiredPolicy1 });
      const myPolicy2 = await app
        .get(EntityManager)
        .getRepository(PolicyEntity)
        .findOneOrFail({ name: requiredPolicy2 });
      const myPolicy3 = await app
        .get(EntityManager)
        .getRepository(PolicyEntity)
        .create({ name: 'myPolicy3' })
        .save();
      const myRole1 = await app
        .get(EntityManager)
        .getRepository(Role)
        .create({ name: 'myRole1' })
        .save();
      const myRole2 = await app
        .get(EntityManager)
        .getRepository(Role)
        .create({ name: 'myRole2' })
        .save();
      await app
        .get(EntityManager)
        .getRepository(RolePolicy)
        .insert([
          { role: myRole1, policy: myPolicy1 },
          { role: myRole1, policy: myPolicy3 },
          { role: myRole2, policy: myPolicy2 },
        ]);
      await app
        .get(EntityManager)
        .getRepository(UserRole)
        .create({ user, role: myRole1 })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserRole)
        .create({ user, role: myRole2 })
        .save();

      const executionContext = fakeRequestResponse({
        user,
      });
      const isGranted = await guard.canActivate(executionContext);

      expect(isGranted).toBe(true);
    });

    it('should return true if contains some required policies in user role policies', async () => {
      const requiredPolicy1 = 'myPolicy1';
      const requiredPolicy2 = 'myPolicy2';
      @Policy(requiredPolicy1)
      class MyClass1 {}

      class MyClass2 {
        @Policy(requiredPolicy2)
        method() {}
      }

      const Guard = PolicyGuard(MyClass1, MyClass2.prototype.method);
      const guard = new Guard(
        app.get(EntityManager).getRepository(UserRole),
        app.get(EntityManager).getRepository(PolicyEntity),
        app.get(EntityManager).getRepository(RolePolicy),
      );
      await guard.onModuleInit();
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({ email: 'john.doe@mail.com' })
        .save();
      const myPolicy1 = await app
        .get(EntityManager)
        .getRepository(PolicyEntity)
        .findOneOrFail({ name: requiredPolicy1 });
      const myPolicy3 = await app
        .get(EntityManager)
        .getRepository(PolicyEntity)
        .create({ name: 'myPolicy3' })
        .save();
      const myRole1 = await app
        .get(EntityManager)
        .getRepository(Role)
        .create({ name: 'myRole1' })
        .save();
      await app
        .get(EntityManager)
        .getRepository(RolePolicy)
        .insert([
          { role: myRole1, policy: myPolicy1 },
          { role: myRole1, policy: myPolicy3 },
        ]);
      await app
        .get(EntityManager)
        .getRepository(UserRole)
        .create({ user, role: myRole1 })
        .save();

      const executionContext = fakeRequestResponse({
        user,
      });
      const isGranted = await guard.canActivate(executionContext);

      expect(isGranted).toBe(true);
    });

    it('should return true if role has policy name "grantAllAccess"', async () => {
      const requiredPolicy1 = 'myPolicy1';
      @Policy(requiredPolicy1)
      class MyClass1 {}

      const Guard = PolicyGuard(MyClass1);
      const guard = new Guard(
        app.get(EntityManager).getRepository(UserRole),
        app.get(EntityManager).getRepository(PolicyEntity),
        app.get(EntityManager).getRepository(RolePolicy),
      );
      await guard.onModuleInit();
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({ email: 'john.doe@mail.com' })
        .save();
      const grantAllAccessPolicy = await app
        .get(EntityManager)
        .getRepository(PolicyEntity)
        .create({ name: 'grantAllAccess' })
        .save();
      const superAdminRole = await app
        .get(EntityManager)
        .getRepository(Role)
        .create({ name: 'superAdmin' })
        .save();
      await app
        .get(EntityManager)
        .getRepository(RolePolicy)
        .insert([{ role: superAdminRole, policy: grantAllAccessPolicy }]);
      await app
        .get(EntityManager)
        .getRepository(UserRole)
        .create({ user, role: superAdminRole })
        .save();

      const executionContext = fakeRequestResponse({
        user,
      });
      const isGranted = await guard.canActivate(executionContext);

      expect(isGranted).toBe(true);
    });
  });
});

describe('PolicyActivatorGuard, Policy', () => {
  let app: TestingModule;

  class CustomActivator implements CanActivate {
    constructor(
      public readonly policies: string[],
      public readonly moduleRef: ModuleRefProxy,
    ) {}

    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      return true;
    }
  }

  async function createGuard() {
    const requiredPolicy = 'myPolicy';

    @Policy(requiredPolicy)
    class MyClass {}

    const Guard = PolicyActivatorGuard(CustomActivator, MyClass);
    const guard = new Guard(
      app.get(EntityManager).getRepository(UserRole),
      app.get(EntityManager).getRepository(PolicyEntity),
      app.get(EntityManager).getRepository(RolePolicy),
      app.get(ModuleRef),
    );
    await guard.onModuleInit();

    const user = await app
      .get(EntityManager)
      .getRepository(User)
      .create({ email: 'john.doe@mail.com' })
      .save();
    const myPolicy = await app
      .get(EntityManager)
      .getRepository(PolicyEntity)
      .findOneOrFail({ name: requiredPolicy });
    const myRole = await app
      .get(EntityManager)
      .getRepository(Role)
      .create({ name: 'myRole' })
      .save();
    await app
      .get(EntityManager)
      .getRepository(RolePolicy)
      .insert([{ role: myRole, policy: myPolicy }]);
    await app
      .get(EntityManager)
      .getRepository(UserRole)
      .create({ user, role: myRole })
      .save();

    return { user, myPolicy, myRole, guard, requiredPolicy };
  }

  beforeAll(async () => {
    app = await beforeAllApp();
  });

  beforeEach(async () => {
    await beforeEachApp(app);
  });

  afterEach(async () => {
    await afterEachApp(app);
  });

  afterAll(async () => {
    await afterAllApp(app);
  });

  describe('#canActivate', () => {
    it('should call activator #canActivate', async () => {
      const { user, guard } = await createGuard();
      const spy = jest.spyOn(CustomActivator.prototype, 'canActivate');

      const isGranted = await guard.canActivate(fakeRequestResponse({ user }));

      expect(spy).toBeCalled();
      expect(isGranted).toBe(true);

      spy.mockReset();
      spy.mockRestore();
    });

    it('should return true if does not pass base guard checking, but pass activator', async () => {
      const { user, guard, myPolicy, requiredPolicy } = await createGuard();
      myPolicy.name = 'shouldFailPolicy';
      const shouldFailPolicy = await myPolicy.save();
      expect(shouldFailPolicy.name).not.toEqual(requiredPolicy);

      const isGranted = await guard.canActivate(fakeRequestResponse({ user }));

      expect(isGranted).toBe(true);
    });
  });
});
