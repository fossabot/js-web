import { TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { User } from '../../user/User.entity';
import {
  afterAllApp,
  afterEachApp,
  beforeAllApp,
  beforeEachApp,
} from '../../utils/testHelpers/setup-integration';
import { QueueModule } from '../queue.module';
import { NotificationProducer } from '../notification.producer';
import { QueueMetadata } from '../queueMetadata';
import { UserAuthProvider } from '../../user/UserAuthProvider.entity';
import { minimalEmailQuery } from './helpers/emailQuery.payload';

describe('NotificationProducer', () => {
  let app: TestingModule;
  const bullProcessorCallback = jest.fn();

  beforeAll(async () => {
    app = await beforeAllApp([
      QueueModule,
      BullModule.registerQueueAsync({
        name: QueueMetadata.notification.queueName,
        useFactory: () => ({
          processors: [
            {
              name: QueueMetadata.notification.events.sendEmail,
              callback: (_, cb) => {
                setTimeout(() => {
                  bullProcessorCallback();
                  cb!();
                }, 1);
              },
            },
          ],
        }),
      }),
    ]);
  });

  beforeEach(async () => {
    await beforeEachApp(app);
    await app
      .get<Queue>(getQueueToken(QueueMetadata.notification.queueName))
      .empty();
  });

  afterEach(async () => {
    await afterEachApp(app);
    bullProcessorCallback.mockClear();
  });

  afterAll(async () => {
    await afterAllApp(app);
  });

  describe('#sendEmail', () => {
    it('should return null without enqueue to bull for non activated user', async () => {
      await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: minimalEmailQuery.to as string,
        })
        .save();

      const job = await app
        .get(NotificationProducer)
        .sendEmail(minimalEmailQuery);
      await job?.finished();

      expect(job).toBeNull();
      expect(bullProcessorCallback).not.toHaveBeenCalled();
    });

    it('should return job and enqueue to bull for activated user', async () => {
      const user = await app
        .get(EntityManager)
        .getRepository(User)
        .create({
          email: minimalEmailQuery.to as string,
        })
        .save();
      await app
        .get(EntityManager)
        .getRepository(UserAuthProvider)
        .create({
          provider: 'password',
          user,
        })
        .save();

      const job = await app
        .get(NotificationProducer)
        .sendEmail(minimalEmailQuery);
      await job?.finished();

      expect(job?.id).toBeDefined();
      expect(bullProcessorCallback).toHaveBeenCalled();
    });
  });
});
