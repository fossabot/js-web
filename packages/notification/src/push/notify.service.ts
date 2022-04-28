import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { UserNotification } from '@seaccentral/core/dist/notification/UserNotification.entity';
import { NotifyData } from '@seaccentral/core/dist/queue/queueMetadata';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { generateVariables } from '@seaccentral/core/dist/utils/interpolate';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class NotifyService {
  constructor(
    @InjectRepository(PushNotification)
    private pushNotification: Repository<PushNotification>,
    @InjectRepository(UserNotification)
    private userNotification: Repository<UserNotification>,
  ) {}

  async getPushNotificationByKey(key: PushNotificationSubCategoryKey) {
    const notification = await this.pushNotification.findOne({
      join: {
        alias: 'pushNotification',
        leftJoin: {
          subCategory: 'pushNotification.category',
        },
      },
      where: (qb: SelectQueryBuilder<PushNotification>) => {
        qb.where('subCategory.key = :key')
          .andWhere('pushNotification.isActive = :isActive')
          .setParameters({
            key,
            isActive: true,
          });
      },
    });

    return notification;
  }

  createNotification(
    notification: PushNotification,
    userId: User['id'],
    variables: NotifyData['variables'],
  ) {
    const generatedVariables = generateVariables(variables);

    return this.userNotification.save({
      user: { id: userId },
      notification,
      notifyDate: new Date(),
      variables: generatedVariables,
    });
  }

  async findAll({ skip, take, order, orderBy }: BaseQueryDto) {
    const query = this.pushNotification
      .createQueryBuilder('pn')
      .leftJoinAndSelect('pn.content', 'content')
      .leftJoinAndSelect('pn.triggerType', 'triggerType')
      .leftJoinAndSelect('pn.category', 'category');

    if (['title', 'isActive'].includes(orderBy)) {
      query.addOrderBy(`pn.${orderBy}`, order);
    } else if (orderBy === 'category') {
      query.addOrderBy('category.name', order);
    }

    const [notifications, count] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { notifications, count };
  }

  async updatePushNotificationStatus(
    id: PushNotification['id'],
    isActive: boolean,
  ) {
    await this.pushNotification.update(id, { isActive });
  }
}
