import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/User.entity';
import { SYSTEM_ROLES } from '../utils/constants';
import { EmailNotification } from './EmailNotification.entity';
import { EmailNotificationSubCategoryKey } from './enum/EmailNotificationSubCategory.enum';
import { NotificationReceiverRole } from './enum/NotificationReceiverRole.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(EmailNotification)
    private emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getEmailReceiverRoles(
    key: EmailNotificationSubCategoryKey,
  ): Promise<{ learner: boolean; instructor: boolean; moderator: boolean }> {
    const template = await this.emailNotificationRepository
      .createQueryBuilder('emailNotif')
      .leftJoinAndSelect('emailNotif.category', 'category')
      .where('emailNotif.isActive = :isActive', { isActive: true })
      .andWhere('category.key = :key', { key })
      .getOne();

    if (!template) {
      throw new HttpException(
        'Email notification template not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const learner = template.receiverRoles.includes(
      NotificationReceiverRole.LEARNER,
    );
    const instructor = template.receiverRoles.includes(
      NotificationReceiverRole.INSTRUCTOR,
    );
    const moderator = template.receiverRoles.includes(
      NotificationReceiverRole.MODERATOR,
    );
    return { learner, instructor, moderator };
  }

  async getModerators() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('role.name = :roleName', {
        roleName: SYSTEM_ROLES.MODERATOR,
      })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();
  }
}
