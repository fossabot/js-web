import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@seaccentral/core/dist/user/users.service';

export const createSession = async (app: INestApplication) => {
  const userService = app.get(UsersService);
  const configService = app.get(ConfigService);
  const jwtService = app.get(JwtService);

  await userService.populateRoles();
  const user = await userService.createRandomUser();

  const payload = { userId: user.id };
  const accessToken = jwtService.sign(payload, {
    secret: configService.get('JWT_SECRET'),
    expiresIn: '1d',
  });

  return { user, accessToken };
};
