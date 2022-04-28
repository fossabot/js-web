import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { BadRequestException, Injectable } from '@nestjs/common';

export interface GoogleProfile extends Profile {
  emails: { value: string; type?: string }[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      session: false,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user = {
      accessToken,
      refreshToken,
      profile,
    };
    if (!profile.emails) {
      return done(new BadRequestException('email address not found'), user);
    }
    return done(null, user);
  }
}
