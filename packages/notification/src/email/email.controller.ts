import { Controller } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiSecurity('auth_token')
@Controller('v1/emails')
@ApiTags('Email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
}
