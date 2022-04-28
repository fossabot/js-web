import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotification } from '@seaccentral/core/dist/notification/UserNotification.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { interpolate } from '@seaccentral/core/dist/utils/interpolate';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { Repository } from 'typeorm';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { getPaginationRequestParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
  ) {}

  async getUserNotification(user: User, dto: BaseQueryDto, lang: LanguageCode) {
    let query =
      this.userNotificationRepository.createQueryBuilder('user_notification');
    query = query
      .where('user_notification.userId = :id', { id: user.id })
      .leftJoinAndSelect('user_notification.notification', 'notification')
      .leftJoinAndSelect('notification.category', 'category')
      .leftJoinAndSelect('notification.content', 'content')
      .leftJoinAndSelect('notification.triggerType', 'triggerType')
      .orderBy('user_notification.createdAt', 'DESC');

    const { take, skip } = getPaginationRequestParams(dto);

    query = query.skip(skip).take(take);

    const data = await query.getMany();
    const count = await query.getCount();

    data.map((item) => {
      // interpolation
      if (lang === 'en' && item.notification.content?.nameEn) {
        item.notification.content.nameEn = interpolate(
          item.notification.content.nameEn,
          item.variables.en,
          {
            noEscape: true,
          },
        );
      } else if (lang === 'th' && item.notification.content?.nameTh) {
        item.notification.content.nameTh = interpolate(
          item.notification.content.nameTh,
          item.variables.th,
          {
            noEscape: true,
          },
        );
      }
      return item;
    });

    return { data, count };
  }

  async getUserUnreadNotificationCount(user: User) {
    let query =
      this.userNotificationRepository.createQueryBuilder('user_notification');
    query = query
      .where('user_notification.userId = :id', { id: user.id })
      .andWhere('user_notification.isRead = :isRead', { isRead: false });
    const count = query.getCount();
    return count;
  }

  async markAllNotificationsAsRead(user: User) {
    const result = await this.userNotificationRepository.update(
      { user, isRead: false },
      { isRead: true },
    );
    return result;
  }

  async markNotificationAsRead(user: User, id: string) {
    const result = await this.userNotificationRepository.update(
      { user, isRead: false, id },
      { isRead: true },
    );
    return result;
  }
}
