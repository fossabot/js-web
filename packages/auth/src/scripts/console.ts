import { NestFactory } from '@nestjs/core';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { AppModule } from '../app.module';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];
  const usersService = application.get(UsersService);
  switch (command) {
    case 'create-random-user':
      await usersService.createRandomUser();
      break;
    default:
      // eslint-disable-next-line no-console
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();
