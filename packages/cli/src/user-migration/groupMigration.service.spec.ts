import { INestApplication } from '@nestjs/common';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { DeepPartial, EntityManager } from 'typeorm';
import {
  afterAllApp,
  afterEachApp,
  beforeAllApp,
  beforeEachApp,
} from '../utils/test-helpers/setup';
import { GroupMigrationService } from './groupMigration.service';

describe('GroupMigrationService', () => {
  let app: INestApplication;

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

  describe('#migrate', () => {
    it('invalid OrgName, return null', async () => {
      const groupMigrationService = app.get(GroupMigrationService);

      const output = await groupMigrationService.migrate({
        org_name: ',',
        group_id: -1,
      });

      expect(output).toEqual(null);
    });

    it('already have existing group, return null', async () => {
      const groupMigrationService = app.get(GroupMigrationService);
      const groupRepository = app.get(EntityManager).getTreeRepository(Group);
      await groupRepository.insert({
        name: 'foo',
        isInstancy: true,
        instancyId: 1,
      });

      const output = await groupMigrationService.migrate({
        org_name: 'foo',
        group_id: 1,
      });

      expect(output).toEqual(null);
    });

    it('save expected value in db given OrgName 1 level', async () => {
      const groupMigrationService = app.get(GroupMigrationService);
      const groupRepository = app.get(EntityManager).getTreeRepository(Group);

      await groupMigrationService.migrate({ org_name: 'lv1', group_id: 1 });

      const trees = await groupRepository.findTrees();
      const [tree] = trees;
      expect(trees.length).toEqual(1);
      expect(tree).toEqual(
        expect.objectContaining<DeepPartial<Group>>({
          isInstancy: true,
          name: 'lv1',
          instancyId: 1,
        }),
      );
    });

    it('save expected value in db given OrgName > 1 level', async () => {
      const groupMigrationService = app.get(GroupMigrationService);
      const groupRepository = app.get(EntityManager).getTreeRepository(Group);

      await groupMigrationService.migrate({
        org_name: 'lv1-lv2-lv3',
        group_id: 1,
      });

      const [lv1, lv2, lv3] = await Promise.all([
        groupRepository.findOne({ name: 'lv1', isInstancy: true }),
        groupRepository.findOne({ name: 'lv2', isInstancy: true }),
        groupRepository.findOne({
          name: 'lv3',
          isInstancy: true,
          instancyId: 1,
        }),
      ]);

      expect(lv1).toBeDefined();
      expect(lv2).toBeDefined();
      expect(lv3).toBeDefined();
    });

    it('assign expected parent given multiple children same level', async () => {
      const groupMigrationService = app.get(GroupMigrationService);
      const groupRepository = app.get(EntityManager).getTreeRepository(Group);

      const v1 = groupRepository.create({
        name: 'lv1',
        isInstancy: true,
      });
      const v2 = groupRepository.create({
        name: 'lv2',
        isInstancy: true,
      });
      const v3 = groupRepository.create({
        name: 'lv3',
        isInstancy: true,
        instancyId: 1,
      });
      await v1.save();
      v2.parent = v1;
      await v2.save();
      v3.parent = v2;
      await v3.save();

      await groupMigrationService.migrate({
        org_name: 'lv1-lv4',
        group_id: 2,
      });

      const [[[lv1], nlv1], [[lv2], nlv2], [[lv4], nlv4]] = await Promise.all([
        groupRepository.findAndCount({ name: 'lv1' }),
        groupRepository.findAndCount({
          relations: ['parent'],
          where: { name: 'lv2' },
        }),
        groupRepository.findAndCount({
          relations: ['parent'],
          where: { name: 'lv4' },
        }),
      ]);

      expect(nlv1).toEqual(1);
      expect(nlv2).toEqual(1);
      expect(nlv4).toEqual(1);
      expect(lv2.parent.id).toEqual(lv1.id);
      expect(lv4.parent.id).toEqual(lv1.id);
    });

    it('update Group.instancyId if subtree exists', async () => {
      const groupMigrationService = app.get(GroupMigrationService);
      const groupRepository = app.get(EntityManager).getTreeRepository(Group);

      const v1 = groupRepository.create({
        name: 'lv1',
        isInstancy: true,
      });
      const v2 = groupRepository.create({
        name: 'lv2',
        isInstancy: true,
      });
      const v3 = groupRepository.create({
        name: 'lv3',
        isInstancy: true,
        instancyId: 1,
      });
      await v1.save();
      v2.parent = v1;
      await v2.save();
      v3.parent = v2;
      await v3.save();

      await groupMigrationService.migrate({
        org_name: 'lv1-lv2',
        group_id: 2,
      });

      const [lv3, lv2] = await Promise.all([
        groupRepository.findOne({
          name: 'lv3',
          isInstancy: true,
          instancyId: 1,
        }),
        groupRepository.findOne({
          name: 'lv2',
          isInstancy: true,
          instancyId: 2,
        }),
      ]);

      expect(lv3).toBeDefined();
      expect(lv2).toBeDefined();
    });
  });
});
