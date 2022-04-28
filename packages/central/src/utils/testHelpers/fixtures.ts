import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { EntityManager, Repository } from 'typeorm';
import { addHours } from 'date-fns';
import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { Policy } from '@seaccentral/core/dist/user/Policy.entity';
import { GOD_MODE } from '@seaccentral/core/dist/access-control/constants';
import { RolePolicy } from '@seaccentral/core/dist/user/RolePolicy.entity';
import { AdminService } from '../../admin/admin.service';

export const createSession = async (app: INestApplication) => {
  const adminService = app.get(AdminService);
  const userService = app.get(UsersService);
  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);

  await userService.populateRoles();
  await adminService.createLoginSetting();
  const user = await userService.createRandomUser();
  const adminRole = await app
    .get(EntityManager)
    .getRepository(Role)
    .findOneOrFail({ name: 'Admin' });
  const allAccessPolicy = await app
    .get(EntityManager)
    .getRepository(Policy)
    .create({ name: GOD_MODE.GRANT_ALL_ACCESS })
    .save();
  await app
    .get(EntityManager)
    .getRepository(RolePolicy)
    .insert({ role: adminRole, policy: allAccessPolicy });
  await app
    .get(EntityManager)
    .getRepository(UserRole)
    .insert({ user, role: adminRole });

  const payload = { userId: user.id };
  const accessToken = jwtService.sign(payload, {
    secret: configService.get('JWT_SECRET'),
    expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
  });

  return { user, accessToken };
};

export const createNewUser = async (app: INestApplication) => {
  const userService = app.get(UsersService);
  return userService.createRandomUser();
};

export const lockUser = async (app: INestApplication, id: string) => {
  const userRepository: Repository<User> = app.get('UserRepository');
  const user = await userRepository.findOne(id);
  if (!user) {
    return null;
  }
  user.accessFailedCount = 10;
  user.isLockedOut = true;
  user.lockoutEndDateUTC = addHours(Date.now(), 5);
  return user.save();
};
