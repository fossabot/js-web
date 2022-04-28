import { TestingModule } from '@nestjs/testing';
import {
  ExternalAuthProviderType,
  UserAuthProvider,
} from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';
import { SocialService } from './social.service';

describe('SocialService', () => {
  let app: TestingModule;
  let usersService: UsersService;

  beforeEach(async () => {
    app = await setupApp();
    usersService = app.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await teardownApp(app);
  });

  describe('#signupUsingOAuth', () => {
    it('returns valid token with user and provider created in db', async () => {
      const inputEmail = 'john@doe.com';
      const inputProvider = ExternalAuthProviderType.Facebook;
      const token = await app
        .get(SocialService)
        .signupUsingOAuth(
          { email: inputEmail },
          { accessToken: '', provider: inputProvider },
        );
      const secret = app.get(ConfigService).get('JWT_SECRET');

      expect(secret).toBeDefined();
      expect(() => jwt.verify(token, secret)).not.toThrow();

      const payload = jwt.verify(token, secret) as any;
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .findOneOrFail(payload.userId);
      expect(user.email).toEqual(inputEmail);

      const provider = await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .findOneOrFail({
          where: {
            userId: payload.userId,
          },
        });

      expect(provider.provider).toEqual(inputProvider);
    });
  });

  describe('#getLoginCredential', () => {
    it('returns valid token if user and provider matches', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: 'john@doe.com',
        })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .create({
          user,
          provider: ExternalAuthProviderType.Facebook,
        })
        .save();

      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.Facebook,
      };
      const token = await app
        .get(SocialService)
        .getLoginCredential('john@doe.com', socialCredential);
      const secret = app.get(ConfigService).get('JWT_SECRET');

      expect(() => jwt.verify(token as string, secret)).not.toThrow();
    });

    it('returns null if email not exist in db', async () => {
      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.Facebook,
      };
      const token = await app
        .get(SocialService)
        .getLoginCredential('', socialCredential);

      expect(token).toBeNull();
    });

    it('throws error if user has no provider', async () => {
      await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: 'john@doe.com',
        })
        .save();

      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.Facebook,
      };
      await expect(() =>
        app
          .get(SocialService)
          .getLoginCredential('john@doe.com', socialCredential),
      ).rejects.toBeDefined();
    });

    it('returns valid token when logging in with same provider', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: 'john@doe.com',
        })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .create({
          user,
          provider: ExternalAuthProviderType.Facebook,
        })
        .save();

      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.Facebook,
      };
      const token = await app
        .get(SocialService)
        .getLoginCredential('john@doe.com', socialCredential);
      const secret = app.get(ConfigService).get('JWT_SECRET');

      expect(() => jwt.verify(token as string, secret)).not.toThrow();
    });

    it('throws error when logging in using different provider same email where password-registered account has email unconfirmed', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: 'john@doe.com',
        })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .create({
          user,
          provider: 'password',
        })
        .save();

      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.Facebook,
      };
      await expect(() =>
        app
          .get(SocialService)
          .getLoginCredential('john@doe.com', socialCredential),
      ).rejects.toBeDefined();
    });

    it('returns valid token when logging in using different provider same email where password-registered account has email confirmed', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: 'john@doe.com',
          isEmailConfirmed: true,
        })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .create({
          user,
          provider: 'password',
        })
        .save();

      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.Facebook,
      };
      const token = await app
        .get(SocialService)
        .getLoginCredential('john@doe.com', socialCredential);

      const secret = app.get(ConfigService).get('JWT_SECRET');
      expect(() => jwt.verify(token as string, secret)).not.toThrow();
    });

    it('returns valid token and creates new provider when oauth with new provider where previously has another different oauth provider', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: 'john@doe.com',
          isEmailConfirmed: true,
        })
        .save();

      await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .create({
          user,
          provider: ExternalAuthProviderType.Facebook,
        })
        .save();

      const socialCredential = {
        accessToken: '',
        provider: ExternalAuthProviderType.LinkedIn,
      };
      const token = await app
        .get(SocialService)
        .getLoginCredential('john@doe.com', socialCredential);

      expect(() =>
        app.get(EntityManager).getRepository(UserAuthProvider).findOneOrFail({
          provider: ExternalAuthProviderType.LinkedIn,
        }),
      ).not.toThrow();
      const secret = app.get(ConfigService).get('JWT_SECRET');
      expect(() => jwt.verify(token as string, secret)).not.toThrow();
    });
  });
});
