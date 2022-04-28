import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderType } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  getPaginationRequestParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { UserEmailNotification } from '@seaccentral/core/dist/notification/UserEmailNotification.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { sendNotificationEmail } from '@seaccentral/core/dist/utils/email';
import addDays from 'date-fns/addDays';
import startOfDay from 'date-fns/startOfDay';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
  GetUserEmailNotificationsQueryDto,
  GetUserEmailNotificationsRange,
} from './dto/GetUserEmailNotificationsQueryDto';

@Injectable()
export class UserEmailNotificationService {
  constructor(
    private readonly usersService: UsersService,

    @InjectRepository(UserEmailNotification)
    private readonly userEmailNotificationRepository: Repository<UserEmailNotification>,
  ) {}

  private getStartDateFromRange(
    range: GetUserEmailNotificationsRange = GetUserEmailNotificationsRange.TODAY,
  ): Date | null {
    let startDate: Date | null = null;
    if (range === GetUserEmailNotificationsRange.TODAY) {
      startDate = startOfDay(new Date());
    } else if (range === GetUserEmailNotificationsRange.LAST_WEEK) {
      startDate = startOfDay(addDays(new Date(), -7));
    } else if (range === GetUserEmailNotificationsRange.LAST_MONTH) {
      startDate = startOfDay(addDays(new Date(), -30));
    } else if (range === GetUserEmailNotificationsRange.ALL) {
      startDate = null;
    }
    return startDate;
  }

  async countByRange(query: GetUserEmailNotificationsQueryDto) {
    const { search } = getSearchRequestParams(query);

    const startDates = [
      GetUserEmailNotificationsRange.TODAY,
      GetUserEmailNotificationsRange.LAST_WEEK,
      GetUserEmailNotificationsRange.LAST_MONTH,
      GetUserEmailNotificationsRange.ALL,
    ].map(this.getStartDateFromRange);

    const builder = this.userEmailNotificationRepository
      .createQueryBuilder('uen')
      .where({ isActive: true });

    if (search) {
      builder.leftJoinAndSelect('uen.user', 'user').andWhere(
        new Brackets((qb) => {
          qb.where('uen.subject ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('user.email ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    return Promise.all(
      startDates.map((startDate) =>
        startDate === null
          ? new SelectQueryBuilder(builder).getCount()
          : new SelectQueryBuilder(builder)
              .andWhere('uen.createdAt >= :startDate', { startDate })
              .getCount(),
      ),
    );
  }

  async list(query: GetUserEmailNotificationsQueryDto) {
    const { search } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);
    const { skip, take } = getPaginationRequestParams(query);

    const builder = this.userEmailNotificationRepository
      .createQueryBuilder('uen')
      .leftJoinAndSelect('uen.user', 'user')
      .leftJoinAndSelect('user.organizationUser', 'organizationUser')
      .leftJoinAndSelect('organizationUser.organization', 'organization')
      .where({ isActive: true });

    const startDate = this.getStartDateFromRange(query.range);

    if (startDate !== null) {
      builder.andWhere('uen.createdAt >= :startDate', { startDate });
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('uen.subject ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('user.email ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (orderBy === 'email') {
      builder.orderBy('user.email', order as OrderType);
    } else if (orderBy === 'organizationName') {
      builder.orderBy('organization.name', order as OrderType);
    } else if (orderBy) {
      builder.orderBy(`uen.${orderBy}`, order as OrderType);
    }

    const count = await builder.getCount();
    const data = await builder.skip(skip).take(take).getMany();

    return { data, count };
  }

  async getItem(id: UserEmailNotification['id']) {
    const userEmailNotification = await this.userEmailNotificationRepository
      .createQueryBuilder('uen')
      .leftJoinAndSelect('uen.user', 'user')
      .leftJoinAndSelect('user.organizationUser', 'organizationUser')
      .leftJoinAndSelect('organizationUser.organization', 'organization')
      .where('uen.id = :id', { id })
      .getOne();

    if (!userEmailNotification) {
      throw new HttpException(
        'User email notification not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return userEmailNotification;
  }

  async create(params: {
    from: string;
    html: string;
    text: string;
    subject: string;
    to: string;
    category: string;
    awsMessageId: string;
  }) {
    const { to, ...body } = params;
    const user = await this.usersService.getByEmail(to);

    if (user) {
      const userEmailNotification =
        await this.userEmailNotificationRepository.create({
          ...body,
          user,
        });
      await this.userEmailNotificationRepository.save(userEmailNotification);
    }
  }

  async resend(id: UserEmailNotification['id']) {
    const uen = await this.getItem(id);
    if (!uen.user.email)
      throw new HttpException('User has no email', HttpStatus.BAD_REQUEST);

    try {
      const params = {
        ...uen,
        to: uen.user.email,
      };
      const result = await sendNotificationEmail(params);
      await this.create({
        category: uen.category,
        from: uen.from,
        html: uen.html,
        subject: uen.subject,
        text: uen.text,
        to: uen.user.email,
        awsMessageId: result.response,
      });
    } catch (err) {
      throw new HttpException(
        'Email could not be sent',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
