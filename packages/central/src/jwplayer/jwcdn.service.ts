import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { addMinutes, getUnixTime } from 'date-fns';
import urljoin from 'url-join';
import crypto from 'crypto';

@Injectable()
export class JWCdnService {
  constructor(private readonly configServie: ConfigService) {}

  readonly host: string = 'https://cdn.jwplayer.com';

  // https://developer.jwplayer.com/jwplayer/docs/protect-your-content-with-signed-urls#create-a-signed-non-jwt-url
  private getNonSignedUrl(path: string, expiresMinute = 5) {
    const secret = this.configServie.get('JWPLAYER_V1_SECRET');
    const exp = getUnixTime(addMinutes(new Date(), expiresMinute));
    const sig = crypto
      .createHash('md5')
      .update(`${path}:${exp}:${secret}`)
      .digest('hex');

    return urljoin(this.host, path, `?exp=${exp}&sig=${sig}`);
  }

  // https://developer.jwplayer.com/jwplayer/docs/protect-your-content-with-signed-urls#create-a-signed-jwt-url
  private getSignedJwtUrl(path: string, expiresMinute = 5) {
    const secret = this.configServie.get('JWPLAYER_V1_SECRET');
    const token = jwt.sign(
      {
        exp: getUnixTime(addMinutes(new Date(), expiresMinute)),
        resource: path,
      },
      secret,
    );

    return urljoin(this.host, path, `?token=${token}`);
  }

  generateMediaUrl(mediaId: string) {
    return this.getSignedJwtUrl(`v2/media/${mediaId}`);
  }

  generatePlayerUrl() {
    const playerId = this.configServie.get('JWPLAYER_PLAYER_ID');
    return this.getNonSignedUrl(`libraries/${playerId}.js`);
  }
}
