import { Strategy, Profile } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      clientID: process.env.LINKEDIN_CLIENTID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['r_emailaddress', 'r_liteprofile'],
      session: false,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: string | Error | null, user?: any) => void,
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
