import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { UserCourseOutlineProgressStatus } from '@seaccentral/core/dist/course/UserCourseOutlineProgressStatus.enum';
import { ScormVersion } from '@seaccentral/core/dist/scorm/ScormVersion.enum';
import { User } from '@seaccentral/core/dist/user/User.entity';
import {
  createPresignedPut,
  retrieveStreamObject,
} from '@seaccentral/core/dist/utils/s3';
import { Repository } from 'typeorm';
import { UserScormProgressDto } from '../course/dto/UserScormProgress.dto';
import { PrepareUploadBody } from './dto/PrepareUploadBody';

@Injectable()
export class ScormService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    @InjectRepository(CourseOutline)
    private courseOutlineRepository: Repository<CourseOutline>,
  ) {}

  async getS3SteamObject(key: string) {
    return retrieveStreamObject(key);
  }

  async getS3PresignedUrl(
    prepareUploadBody: PrepareUploadBody,
    folder: string,
  ) {
    const bucket = process.env.S3_MAIN_BUCKET_NAME || '';
    const promises = prepareUploadBody.keys.map(async (key) => {
      return {
        key,
        url: await createPresignedPut({
          Bucket: bucket,
          Key: `${folder}/${key}`,
          Expires: 120,
          ContentType: '',
          ACL: 'private',
        }),
      };
    });
    return Promise.all(promises);
  }

  async generateTemporaryAccessToken(user: User) {
    return this.jwtService.signAsync(
      { userId: user.id, generatedAt: new Date() },
      {
        expiresIn: `${this.configService.get(
          'SCORM_JWT_EXPIRATION_TIME_IN_SECONDS',
        )}s`,
        secret: this.configService.get('SCORM_JWT_SECRET'),
      },
    );
  }

  // TODO ACL permission if user is eligible to access the scorm
  async verifyAccess(courseOutlineId: string, user: User) {
    const courseOutline = await this.courseOutlineRepository.findOne({
      id: courseOutlineId,
    });

    if (!courseOutline) throw new NotFoundException('CourseOutline not found'); // If throw 401, the http service on web will try to refresh the jwt

    return courseOutline;
  }

  scormMetadataToOutlineProgress(userScormProgressDto: UserScormProgressDto) {
    const { status: scormStatus, version, suspend_data } = userScormProgressDto;

    let percentage = 0;
    let status: UserCourseOutlineProgressStatus =
      UserCourseOutlineProgressStatus.ENROLLED;
    const isSuspendDataPercentage = new RegExp('^[\\d]+([.][\\d]+)?$').test(
      suspend_data,
    );

    if (version === ScormVersion['Ver1.2']) {
      const isCompleted = scormStatus === 'passed';

      if (isCompleted) percentage = 100;
      else if (isSuspendDataPercentage)
        percentage = this.stringToPercentage(suspend_data);
      else percentage = 50;

      status = isCompleted
        ? UserCourseOutlineProgressStatus.COMPLETED
        : UserCourseOutlineProgressStatus.IN_PROGRESS;
    }

    if (
      [
        ScormVersion['Ver2.2nd'],
        ScormVersion['Ver2.3nd'],
        ScormVersion['Ver2.4th'],
      ].includes(version as ScormVersion)
    ) {
      const isCompleted = scormStatus === 'completed';

      if (isCompleted) percentage = 100;
      else if (isSuspendDataPercentage)
        percentage = this.stringToPercentage(suspend_data);
      else percentage = 50;

      status = isCompleted
        ? UserCourseOutlineProgressStatus.COMPLETED
        : UserCourseOutlineProgressStatus.IN_PROGRESS;
    }

    return {
      percentage,
      status,
    };
  }

  stringToPercentage(numeric: string) {
    const percentage = Math.round(parseFloat(numeric));
    return percentage > 100 ? 100 : percentage;
  }
}
