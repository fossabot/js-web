import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { Injectable, BadRequestException } from '@nestjs/common';

export interface FacebookProfile extends Profile {
  emails: { value: string; type?: string }[];
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APPID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      scope: ['public_profile'],
      profileFields: ['emails', 'name'],
      session: false,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (err: any, user: any, info?: any) => void,
  ) {
    const user = {
      profile,
      accessToken,
      refreshToken,
    };

    if (!profile.emails) {
      return done(new BadRequestException('email address not found'), user);
    }
    return done(null, user);
  }
}
