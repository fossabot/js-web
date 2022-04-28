import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../user/Role.entity';
import { Policy } from '../user/Policy.entity';
import { RolePolicy } from '../user/RolePolicy.entity';
import { UserRole } from '../user/UserRole.entity';
import { UsersService } from '../user/users.service';
import { GOD_MODE } from '../access-control/constants';
import { SYSTEM_ROLES } from '../utils/constants';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePolicy)
    private readonly rolePolicyRepository: Repository<RolePolicy>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly userService: UsersService,
  ) {}

  async createRootUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    console.log('===Create root user===');
    const existing = await this.userService.getByEmail(email);
    if (existing) {
      console.log(`${email} is already exists. Do nothing`);
      return;
    }

    const user = await this.userService.create({ email, firstName, lastName });
    await this.userService.createProviderByPassword(user, password);

    const rootRole = await this.createRoleIfNotExist(SYSTEM_ROLES.ROOT);
    const policy = await this.createPolicyIfNotExist(GOD_MODE.GRANT_ALL_ACCESS);
    await this.createRolePolicyIfNotExist(rootRole, policy);

    const userRole = await this.userRoleRepository.findOne({
      where: { user, role: rootRole },
    });

    if (!userRole) {
      await this.userRoleRepository.insert({ user, role: rootRole });
    }
  }

  async createUser(
    email: string,
    password: string,
    roleName: string,
    firstName: string,
    lastName: string,
    policies: string[] = [],
  ): Promise<void> {
    console.log(`===Create users for email ${email}===`);
    const existing = await this.userService.getByEmail(email);
    if (existing) {
      console.log(`${email} is already exists. Do nothing`);
      return;
    }

    const user = await this.userService.create({ email, firstName, lastName });
    await this.userService.createProviderByPassword(user, password);

    const role = await this.createRoleIfNotExist(roleName);

    await Promise.all(
      policies.map(async (_policy) => {
        const policy = await this.createPolicyIfNotExist(_policy);
        await this.createRolePolicyIfNotExist(role, policy);
      }),
    );

    const userRole = await this.userRoleRepository.findOne({
      where: { user, role },
    });
    if (!userRole) {
      await this.userRoleRepository.insert({ user, role });
    }
  }

  private async createRoleIfNotExist(role: string) {
    let roleEntity = await this.roleRepository.findOne({
      where: { name: role },
    });
    if (!roleEntity) {
      roleEntity = await this.roleRepository.create({ name: role }).save();
    }

    return roleEntity;
  }

  private async createPolicyIfNotExist(policyName: string) {
    let policy = await this.policyRepository.findOne({
      where: { name: policyName },
    });
    if (!policy) {
      policy = await this.policyRepository.create({ name: policyName }).save();
    }

    return policy;
  }

  private async createRolePolicyIfNotExist(role: Role, policy: Policy) {
    const rolePolicy = await this.rolePolicyRepository.findOne({
      where: { role, policy },
    });
    if (!rolePolicy) {
      await this.rolePolicyRepository.insert({
        policy,
        role,
      });
    }

    return rolePolicy;
  }
}
