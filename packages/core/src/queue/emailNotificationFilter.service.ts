import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { uniq } from 'lodash';
import { UserAuthProvider } from '../user/UserAuthProvider.entity';
import { UserEnrolledCourse } from '../course/UserEnrolledCourse.entity';
import { SendEmailQuery } from '../notification/dto/SendEmailQuery';

@Injectable()
export class EmailNotificationFilterService {
  constructor(
    @InjectRepository(UserAuthProvider)
    private readonly userAuthProvider: Repository<UserAuthProvider>,
  ) {}

  async filterActivatedUser(email: SendEmailQuery) {
    const recipients = Array.isArray(email.to) ? email.to : [email.to];
    const uaps = await this.userAuthProvider.find({
      join: {
        alias: 'uap',
        leftJoin: {
          user: 'uap.user',
        },
      },
      where: (qb: SelectQueryBuilder<UserEnrolledCourse>) => {
        qb.where('user.email IN (:...emails)', { emails: recipients })
          .andWhere('user.isActive = :isActive', { isActive: true })
          .andWhere('user.isActivated = :isActivated', { isActivated: true });
      },
    });

    return uniq(uaps.map((uap) => uap.user.email as string));
  }
}
