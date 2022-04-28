import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/EmailNotificationSubCategory.enum';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { User } from '@seaccentral/core/dist/user/User.entity';
import urljoin from 'url-join';

@Injectable()
export class PasswordResetMailer {
  constructor(
    private readonly configService: ConfigService,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  async sendEmailPasswordReset(user: User, passwordResetToken: string) {
    const resetPasswordUrl = urljoin(
      this.configService.get('CLIENT_BASE_URL') || '',
      'reset-password',
      encodeURIComponent(passwordResetToken),
    );

    if (user.email) {
      this.notificationProducer.sendEmail({
        key: EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD,
        to: user.email,
        language: user.emailNotificationLanguage,
        replacements: {
          [NotificationVariableDict.FULL_NAME.alias]: user.fullName,
          [NotificationVariableDict.EMAIL.alias]: user.email,
          [NotificationVariableDict.RESET_PASSWORD_LINK.alias]:
            resetPasswordUrl,
        },
      });
    }
  }
}
