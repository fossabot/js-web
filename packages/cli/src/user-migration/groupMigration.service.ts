/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */

import { TreeRepository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';

import { Migratable } from '../utils/migratable';
import { IOrgNameResult } from '../instancy/instancy.service';

@Injectable()
export class GroupMigrationService
  extends TransactionFor<GroupMigrationService>
  implements Migratable<IOrgNameResult>
{
  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(Group)
    private readonly groupRepository: TreeRepository<Group>,
  ) {
    super(moduleRef);
  }

  async migrate(orgGroup: IOrgNameResult) {
    const { group_id: GroupID, org_name: OrgName } = orgGroup;
    const names = this.extractNames(OrgName);

    const existingRecord = await this.groupRepository.findOne({
      instancyId: GroupID,
    });
    if (!names || existingRecord) {
      return null;
    }

    const tree = await this.makeTree(GroupID, names);

    return tree;
  }

  setup() {
    return Promise.resolve();
  }

  done() {
    return Promise.resolve();
  }

  extractNames(orgName: string) {
    const wordRegex = /\w+( \w+)*/g;
    return orgName.match(wordRegex);
  }

  async makeTree(instancyId: number, names: string[]) {
    let parentId: string | null = null;

    for (let i = 0; i < names.length; i += 1) {
      const groups = await this.groupRepository.find({
        name: names[i],
      });

      let group = groups.find((g) =>
        parentId ? g.parentId === parentId : !g.parentId,
      );

      if (!group) {
        group = this.groupRepository.create({
          name: names[i],
          isInstancy: true,
        });
      }

      if (parentId) {
        group.parent = { id: parentId } as Group;
      }

      if (i === names.length - 1) {
        group.instancyId = instancyId;
      }

      await this.groupRepository.save(group);
      parentId = group.id;
    }
  }
}
