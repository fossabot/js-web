import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { CompanySizeRange } from '@seaccentral/core/dist/user/Range.entity';

import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';
import { plainToClass } from 'class-transformer';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { UpdateProfileInfoDto } from './dto/UpdateProfileInfo.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    @InjectRepository(CompanySizeRange)
    private readonly companySizeRangeRepository: Repository<CompanySizeRange>,
  ) {}

  async getUserProfileInfo(userId: string) {
    const user = await this.userRepository.findOne({
      relations: [
        'userRoles',
        'userRoles.role',
        'companySizeRange',
        'industry',
      ],
      where: {
        isActive: true,
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateProfileInfo(
    user: User,
    updateProfileInfo: UpdateProfileInfoDto,
  ): Promise<User> {
    if (!this.isInRole(SYSTEM_ROLES.INSTRUCTOR, user.userRoles)) {
      updateProfileInfo.shortSummary = null;
      updateProfileInfo.bio = null;
      updateProfileInfo.experience = null;
    }

    const { industry, companySizeRange, phoneNumber, ...rest } =
      updateProfileInfo;

    if (
      phoneNumber &&
      user.phoneNumber !== phoneNumber &&
      (await this.hasPhoneNumber(phoneNumber))
    ) {
      throw new HttpException(
        { code: 'DUPLICATE_PHONENUMBER' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.userRepository.save({
      ...rest,
      id: user.id,
      phoneNumber,
      industry: industry
        ? this.industryRepository.create({ id: industry })
        : null,
      companySizeRange: companySizeRange
        ? this.companySizeRangeRepository.create({ id: companySizeRange })
        : null,
    });

    return plainToClass(User, { ...result, userRoles: user.userRoles });
  }

  async updateEmailNotificationLanguage(user: User, language: LanguageCode) {
    const result = this.userRepository.update(
      { id: user.id },
      { emailNotificationLanguage: language },
    );
    return plainToClass(User, result);
  }

  async hasPhoneNumber(phoneNumber: string) {
    const nNumber = await this.userRepository.count({ phoneNumber });

    return nNumber > 0;
  }

  async updateAvatar(user: User, key: string) {
    return this.userRepository.update(
      { id: user.id },
      { profileImageKey: key },
    );
  }

  private isInRole(role: string, userRoles?: UserRole[]): boolean {
    if (!userRoles) return false;

    return userRoles.some((ur) => ur.role.name === role);
  }
}
