import { Repository } from 'typeorm';
import { addSeconds } from 'date-fns';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { ActivateAccountReminder } from './activateAccountReminder';

function getMocks() {
  const notificationProducer = createMock<NotificationProducer>();
  const emailNotificationRepository = createMock<Repository<EmailNotification>>(
    {
      findOne: async () =>
        createMock<EmailNotification>({
          triggerType: { triggerSeconds: [259200] },
        }),
    },
  );
  const configService = createMock<ConfigService>({
    get: () => 'http://localhost:3000',
  });

  const invitationRepository = createMock<Repository<Invitation>>({
    find: async () => [
      createMock<Invitation>({
        createdAt: addSeconds(new Date(), -259300), // invited 3 days ago
        email: 'test@nozoo.com',
      }),
      createMock<Invitation>({
        createdAt: addSeconds(new Date(), -25930000), // invited long time ago
        email: 'tong@nozoo.com',
      }),
    ],
  });

  return {
    notificationProducer,
    emailNotificationRepository,
    configService,
    invitationRepository,
  };
}

describe('activateAccountReminder', () => {
  describe('execute', () => {
    it('should not send email or do any further query if there is no such email notification template', async () => {
      const {
        notificationProducer,
        configService,
        emailNotificationRepository,
        invitationRepository,
      } = getMocks();

      emailNotificationRepository.findOne.mockResolvedValue(undefined);

      const target = new ActivateAccountReminder(
        emailNotificationRepository,
        notificationProducer,
        configService,
        invitationRepository,
      );

      await target.execute();

      expect(emailNotificationRepository.findOne).toBeCalledTimes(1);
      expect(invitationRepository.find).not.toBeCalled();
    });

    it('should send email to invitees never activated account for X (configured) days', async () => {
      const {
        notificationProducer,
        configService,
        emailNotificationRepository,
        invitationRepository,
      } = getMocks();

      const target = new ActivateAccountReminder(
        emailNotificationRepository,
        notificationProducer,
        configService,
        invitationRepository,
      );

      await target.execute();

      expect(invitationRepository.find).toBeCalledTimes(1);
      expect(notificationProducer.sendEmail).toBeCalledWith(
        expect.objectContaining({ to: 'test@nozoo.com' }),
      );
    });

    it('should not send email to invitees who have not activated account for long time ago', async () => {
      const {
        notificationProducer,
        configService,
        emailNotificationRepository,
        invitationRepository,
      } = getMocks();

      const target = new ActivateAccountReminder(
        emailNotificationRepository,
        notificationProducer,
        configService,
        invitationRepository,
      );

      await target.execute();

      expect(invitationRepository.find).toBeCalledTimes(1);
      expect(notificationProducer.sendEmail).not.toBeCalledWith(
        expect.objectContaining({ to: 'tong@nozoo.com' }),
      );
    });
  });
});
