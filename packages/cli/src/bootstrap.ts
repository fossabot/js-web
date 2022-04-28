import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

export default async function bootstrap() {
  await CommandFactory.run(AppModule, ['log', 'warn', 'error']);
}
