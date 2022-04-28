import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import { deleteObjectFromS3 } from '@seaccentral/core/dist/utils/s3';
import { isWithinInterval } from 'date-fns';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SaveSystemAnnouncementDto } from './dto/SaveSystemAnnouncement.dto';

@Injectable()
export class SystemAnnouncementService {
  constructor(
    @InjectRepository(SystemAnnouncement)
    private readonly systemAnnouncementRepository: Repository<SystemAnnouncement>,
  ) {}

  async findAll({ skip, take, order, orderBy }: BaseQueryDto) {
    const query = this.systemAnnouncementRepository
      .createQueryBuilder('sa')
      .innerJoinAndSelect('sa.title', 'title')
      .innerJoinAndSelect('sa.message', 'message');

    if (['endDate', 'startDate', 'title', 'isActive'].includes(orderBy)) {
      query.addOrderBy(`sa.${orderBy}`, order);
    } else {
      query.addOrderBy('sa.endDate', 'ASC');
    }

    const [announcements, count] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { announcements, count };
  }

  async findOne(id: string) {
    const systemAnnouncement = await this.systemAnnouncementRepository.findOne(
      id,
    );

    if (!systemAnnouncement) {
      throw new HttpException(
        'System announcement does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return systemAnnouncement;
  }

  async deleteById(id: string) {
    const sa = await this.findOne(id);

    if (sa.imageKey) {
      deleteObjectFromS3(sa.imageKey);
    }

    return this.systemAnnouncementRepository.delete({ id });
  }

  async getActive(now: string) {
    const nowDate = new Date(now);
    const systemAnnouncement = await this.systemAnnouncementRepository.findOne(
      undefined,
      {
        where: {
          startDate: LessThanOrEqual(nowDate),
          endDate: MoreThanOrEqual(nowDate),
          isActive: true,
        },
      },
    );

    return systemAnnouncement;
  }

  private async checkOverlappingActiveSystemAnnouncements(
    params:
      | {
          type: 'id';
          id: SystemAnnouncement['id'];
        }
      | { type: 'date'; startDate: Date; endDate: Date },
  ) {
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (params.type === 'id') {
      const sa = await this.systemAnnouncementRepository.findOne(params.id);
      if (sa) {
        startDate = new Date(sa.startDate);
        endDate = new Date(sa.endDate);
      }
    } else {
      startDate = new Date(params.startDate);
      endDate = new Date(params.endDate);
    }

    const possibleConflicts = await this.systemAnnouncementRepository.find({
      where: {
        isActive: true,
      },
    });

    const conflict = possibleConflicts.find((pcsa) => {
      if (params.type === 'id' && pcsa.id === params.id) return false;
      if (startDate === null || endDate === null) return false;

      if (
        isWithinInterval(startDate, {
          start: new Date(pcsa.startDate),
          end: new Date(pcsa.endDate),
        })
      ) {
        return true;
      }

      if (
        isWithinInterval(endDate, {
          start: new Date(pcsa.startDate),
          end: new Date(pcsa.endDate),
        })
      ) {
        return true;
      }

      if (
        isWithinInterval(new Date(pcsa.startDate), {
          start: startDate,
          end: endDate,
        })
      ) {
        return true;
      }

      if (
        isWithinInterval(new Date(pcsa.endDate), {
          start: startDate,
          end: endDate,
        })
      ) {
        return true;
      }

      return false;
    });

    if (conflict) {
      throw new ForbiddenException(
        ERROR_CODES.OVERLAPPING_SYSTEM_ANNOUNCEMENTS,
      );
    }
  }

  async updateSystemAnnouncementStatus(
    id: SystemAnnouncement['id'],
    isActive: boolean,
  ) {
    if (isActive) {
      await this.checkOverlappingActiveSystemAnnouncements({ type: 'id', id });
    }

    await this.systemAnnouncementRepository.update(id, { isActive });
  }

  async saveSystemAnnouncement(dto: SaveSystemAnnouncementDto) {
    await this.checkOverlappingActiveSystemAnnouncements(
      dto.id
        ? { type: 'id', id: dto.id }
        : {
            type: 'date',
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
          },
    );

    if (dto.id) {
      const sa = await this.systemAnnouncementRepository.findOne({
        id: dto.id,
      });
      if (sa?.imageKey && dto.imageKey !== sa?.imageKey) {
        deleteObjectFromS3(sa.imageKey);
      }
    }
    const sa = await this.systemAnnouncementRepository.save({
      id: dto.id,
      endDate: dto.endDate,
      startDate: dto.startDate,
      imageKey: dto.imageKey,
      message: {
        nameEn: dto.messageEn,
        nameTh: dto.messageTh,
      },
      title: {
        nameEn: dto.titleEn,
        nameTh: dto.titleTh,
      },
      messageEndDateTime: dto.messageEndDateTime,
      messageStartDateTime: dto.messageStartDateTime,
    });
    return sa;
  }
}
